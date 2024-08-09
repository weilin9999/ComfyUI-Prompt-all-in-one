from server import PromptServer
from aiohttp import web
import os
import folder_paths
import hashlib
import json

# code from pysssss thanks

dir = os.path.join(os.path.dirname(__file__),'../autocomplete/')
if not os.path.exists(dir):
    os.mkdir(dir)
file = os.path.join(dir, "autocomplete.txt")


def get_metadata(filepath):
    with open(filepath, "rb") as file:
        # https://github.com/huggingface/safetensors#format
        # 8 bytes: N, an unsigned little-endian 64-bit integer, containing the size of the header
        header_size = int.from_bytes(file.read(8), "little", signed=False)

        if header_size <= 0:
            raise BufferError("Invalid header size")

        header = file.read(header_size)
        if header_size <= 0:
            raise BufferError("Invalid header")

        header_json = json.loads(header)
        return header_json["__metadata__"] if "__metadata__" in header_json else None


def runApp():
    @PromptServer.instance.routes.get("/weilin/autocomplete")
    async def get_autocomplete(request):
        if os.path.isfile(file):
            return web.FileResponse(file)
        return web.Response(status=404)


    @PromptServer.instance.routes.post("/weilin/autocomplete")
    async def update_autocomplete(request):
        with open(file, "w", encoding="utf-8") as f:
            f.write(await request.text())
        return web.Response(status=200)


    @PromptServer.instance.routes.get("/weilin/autocomplete/loras")
    async def get_loras(request):
        loras = folder_paths.get_filename_list("loras")
        return web.json_response(list(map(lambda a: os.path.splitext(a)[0], loras)))


    @PromptServer.instance.routes.get("/weilin/autocomplete/metadata/{name}")
    async def load_metadata(request):
        name = request.match_info["name"]
        pos = name.index("/")
        type = name[0:pos]
        name = name[pos+1:]

        file_path = None
        if type == "embeddings" or type == "loras":
            name = name.lower()
            files = folder_paths.get_filename_list(type)
            for f in files:
                lower_f = f.lower()
                if lower_f == name:
                    file_path = folder_paths.get_full_path(type, f)
                else:
                    n = os.path.splitext(f)[0].lower()
                    if n == name:
                        file_path = folder_paths.get_full_path(type, f)

                if file_path is not None:
                    break
        else:
            file_path = folder_paths.get_full_path(
                type, name)
        if not file_path:
            return web.Response(status=404)

        try:
            meta = get_metadata(file_path)
        except:
            meta = None

        if meta is None:
            meta = {}

        file_no_ext = os.path.splitext(file_path)[0]

        info_file = file_no_ext + ".txt"
        if os.path.isfile(info_file):
            with open(info_file, "r") as f:
                meta["weilin_autocom.notes"] = f.read()

        hash_file = file_no_ext + ".sha256"
        if os.path.isfile(hash_file):
            with open(hash_file, "rt") as f:
                meta["weilin_autocom.sha256"] = f.read()
        else:
            with open(file_path, "rb") as f:
                meta["weilin_autocom.sha256"] = hashlib.sha256(f.read()).hexdigest()
            with open(hash_file, "wt") as f:
                f.write(meta["weilin_autocom.sha256"])

        return web.json_response(meta)


    @PromptServer.instance.routes.post("/weilin/autocomplete/metadata/notes/{name}")
    async def save_notes(request):
        name = request.match_info["name"]
        pos = name.index("/")
        type = name[0:pos]
        name = name[pos+1:]

        file_path = None
        if type == "embeddings" or type == "loras":
            name = name.lower()
            files = folder_paths.get_filename_list(type)
            for f in files:
                lower_f = f.lower()
                if lower_f == name:
                    file_path = folder_paths.get_full_path(type, f)
                else:
                    n = os.path.splitext(f)[0].lower()
                    if n == name:
                        file_path = folder_paths.get_full_path(type, f)

                if file_path is not None:
                    break
        else:
            file_path = folder_paths.get_full_path(
                type, name)
        if not file_path:
            return web.Response(status=404)

        file_no_ext = os.path.splitext(file_path)[0]
        info_file = file_no_ext + ".txt"
        with open(info_file, "w") as f:
            f.write(await request.text())

        return web.Response(status=200)

