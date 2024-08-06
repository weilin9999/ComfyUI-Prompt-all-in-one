import os

styles_path = os.path.join(os.path.dirname(__file__), "../../styles")
styles_path = os.path.normpath(styles_path)
print(styles_path)