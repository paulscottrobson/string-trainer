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
		musicToApp = ("/".join([".." for x in subtree.split("/")]))+"/index.html"

		songs = [f for f in os.listdir(pathToMusic) if os.path.isfile(os.path.join(pathToMusic, f))]
		songs = [f for f in songs if f[-5:] == ".json"]
		songs.sort()
		titles = [self.ccase(f.replace("-"," ").replace("_"," ").replace(".json","")) for f in songs]

		h = open(pathToMusic+"/index.html","w")
		h.write("<html>\n<head>\n</head>\n<body>\n")

		for p in range(0,2):
			h.write("<h1>{0}</h1>\n".format("Complete" if p == 0 else "Melody Only"))
			for n in range(0,len(songs)):
				url = musicToApp+"?music={0}/{1}".format(subtree,songs[n])
				if p == 1:
					url = url + "&options=melody"
				h.write('<h2><a href="{0}">{1}</a></h2>\n'.format(url,titles[n]))	
		h.write("</body>\n</html>\n")
		h.close()

	def ccase(self,x):
		return " ".join([x[0].upper()+x[1:].lower() for x in x.split(" ")])

if __name__ == '__main__':
	w = IndexGenerator("../app","../app/music/zawcarols")
	