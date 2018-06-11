# ******************************************************************************************
# ******************************************************************************************
#
#									Index Generator.
#
# ******************************************************************************************
# ******************************************************************************************

import os

class IndexGenerator:
	def __init__(self,pathToApp,pathToMusic):
		assert pathToMusic[:len(pathToApp)+1] == pathToApp+"/","music should be under app path"
		subtree = pathToMusic[len(pathToApp)+1:]
		musicToApp = (os.sep.join([".." for x in subtree.split(os.sep)]))+os.sep+"index.html"

		songs = [f for f in os.listdir(pathToMusic) if os.path.isfile(os.path.join(pathToMusic, f))]
		songs = [f for f in songs if f[-5:] == ".json"]
		songs.sort()
		titles = [self.ccase(f.replace("-"," ").replace("_"," ").replace(".json","")) for f in songs]

		h = open(pathToMusic+"/index.html","w")
		h.write("<html>\n")
		h.write("<style>\nbody { background-color:#FF8000; }</style>\n")
		h.write("<head>\n</head>\n<body>\n")

		for p in range(0,3):
			title = "Complete" if p == 0 else "Melody Only"
			title = title if p != 2 else "Bass only"
			h.write("<h1>{0}</h1>\n".format(title))
			h.write("<ul>\n")
			for n in range(0,len(songs)):
				url = musicToApp+"?music={0}/{1}".format(subtree,songs[n])
				if p == 1:
					url = url + "&options=melody"
				if p == 1:
					url = url + "&options=bass"
				h.write('<li><h3><a href="{0}">{1}</a></h3></li>\n'.format(url,titles[n]))	
			h.write("</ul>\n")
		h.write("</body>\n</html>\n")
		h.close()

	def ccase(self,x):
		return " ".join([x[0].upper()+x[1:].lower() for x in x.split(" ")])

if __name__ == '__main__':
	w = IndexGenerator("../app","../app/music/zawcarols")
