# -*- coding: utf-8 -*-

import os

exclude = ["venv"] # File directories to be excluded
for root, dirs, files in os.walk('.'):
    dirs[:] = list(set(dirs) - set(exclude))
    if 'migrations' in dirs:
        dir = dirs[dirs.index('migrations')]
        for root_j, dirs_j, files_j in os.walk(os.path.join(root, dir)):
            for file_k in files_j:
                if file_k != '__init__.py':
                    dst_file = os.path.join(root_j, file_k)
                    print('Deleting file>>> ', dst_file)
                    os.remove(dst_file)