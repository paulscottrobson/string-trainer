# ******************************************************************************************
# ******************************************************************************************
#
#									IMusic Builder
#
# ******************************************************************************************
# ******************************************************************************************

import os
from buildindex import *
from mc import *

class MusicBuilder(object):
	def __init__(self,sourceDir,targetDir,fileList):
		if not os.path.exists(targetDir):
			print("\tCreating "+targetDir)
			os.makedirs(targetDir)
		for f in [x for x in fileList if x[-6:] == ".music"]:
			mc = MusicCompiler()
			print("\tCompiling \"{0}\"".format(f))
			mc.compile(sourceDir+os.sep+f)
			fTarget = targetDir+(os.sep+f[:-6].lower())+".json"
			print("\tWriting to \"{0}\"".format(f[:-6]+".json"))
			mc.write(fTarget)

if __name__ == '__main__':
	sourceRoot = "../music"
	targetRoot = "../app/music-json"
	appPath = "../app"
	for root,dirs,files in os.walk(sourceRoot):
		if root != sourceRoot:
			print("Processing directory '{0}'".format(root))
			#print(root,dirs,files)
			sourceDir = root
			targetDir = targetRoot+sourceDir[len(sourceRoot):]
			files.sort()
			m = MusicBuilder(sourceDir,targetDir,files)
			print("\tBuilding index file.")
			b = IndexGenerator(appPath,targetDir)