import sys
import os

AIO_PATH = os.path.abspath('./sd_webui_prompt_all_in_one/')
sys.path.append(AIO_PATH)

from . import launch

def run_install():
    install_path = os.path.join(AIO_PATH, 'install.py')
    if os.path.exists(install_path):
        print(f"== WeiLin prompt-all-in-one == Running install.py...")
        env = os.environ.copy()
        env['PYTHONPATH'] = f"{os.path.abspath('.')}{os.pathsep}{env.get('PYTHONPATH', '')}"

        stdout = launch.run(f'"{sys.executable}" "{install_path}"', errdesc=f"Error running install.py", custom_env=env).strip()
        if stdout:
            print(stdout)

        print(f"Finished running install.py.")
