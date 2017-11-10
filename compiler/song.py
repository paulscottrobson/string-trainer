# ****************************************************************************************
# ****************************************************************************************
#
#							Set of classes encapsulates a song
#
# ****************************************************************************************
# ****************************************************************************************

import re

# ****************************************************************************************
# 									A single note
# ****************************************************************************************

class Note:
	def __init__(self,notedef,accidentals):
		# check syntax
		m = re.match("^([a-gA-G\&][\#\\b]?)([\-\=o\.]*)$",notedef)
		assert m is not None,"Can't understand "+notedef	
		# save length info ; we don't care
		self.lengthInfo = m.group(2)
		# work out octave L/C 3 , U/C 4
		note = m.group(1)
		octave = 3 if note[0] >= 'a' else 4
		# adjust for any accidentals given.
		note = note.lower()
		if len(note) == 1 and note in accidentals:
			note = accidentals[note]
		# convert to note offset (C0 = 0) or rest (-1)
		if note == "&":
			self.noteID = -1
		else:
			self.noteID = Note.toIndex(note+str(octave))

	def analyse(self,transpose,usage):
		if self.noteID > 0:
			note = self.noteID + transpose
			if note not in usage:
				usage[note] = 0
			usage[note] += 1

	@staticmethod
	def toIndex(name):
		return Note.index[name[:-1].lower()]+int(name[-1])*12
	@staticmethod
	def toName(index):
		return Note.nameix[index % 12] + str(int(index/12))

Note.index = { "c":0,"c#":1,"d":2,"d#":3,"e":4,"f":5,"f#":6,"g":7,"g#":8,"a":9,"a#":10,"b":11, \
			   "db":1,"eb":3,"gb":6,"ab":8,"bb":10 }
Note.nameix = [ "c","c#","d","d#","e","f","f#","g","g#","a","a#","b" ]

# ****************************************************************************************
#										Single Bar
# ****************************************************************************************

class Bar:
	def __init__(self,bardef,accidentals):
		self.notes = []
		for n in [x.strip() for x in bardef.split(" ") if x.strip() != ""]:
			self.notes.append(Note(n,accidentals))

	def analyse(self,transpose,usage):
		for note in self.notes:
			note.analyse(transpose,usage)

# ****************************************************************************************
#											A song
# ****************************************************************************************

class Song:
	def __init__(self,source):
		# load and process
		src = [x.replace("\t"," ").replace("\n"," ") for x in open(source).readlines()]
		src = [x if x.find("//") < 0 else x[:x.find("//")] for x in src]
		src = [x.strip() for x in src if x.strip() != ""]
		# load in equates with default accidentals (none at all)
		self.keys = { "accidentals":"" }
		for ass in [x for x in src if x.find(":=") >= 0]:
			ass = [x.strip() for x in ass.split(":=")]
			self.keys[ass[0].lower()] = ass[1]
		src = [x for x in src if x.find(":=") < 0]
		# work out accidentals hash.			
		self.accidentals = {}
		for a in [x.strip() for x in self.keys["accidentals"].lower().split(",") if x.strip() != ""]:
			self.accidentals[a[0]] = a
		del self.keys["accidentals"]		
		# interpret bars
		#print(src)
		self.bars = []
		for srclines in src:
			for barDef in [x.strip() for x in srclines.split("|") if x.strip() != ""]:
				self.bars.append(Bar(barDef,self.accidentals))

	def analyse(self,transpose):
		# get all the notes used in the song, and how many times each are used.
		noteUsage = {}
		for bar in self.bars:
			bar.analyse(transpose,noteUsage)
		return noteUsage

x = Song("here-comes-the-sun.song")
print(x.analyse(0))
print(x.analyse(1))
print(x.analyse(-1))
print(Note.toName(49))
#
# TODO: Analyse the notes of the song against different transpositions and tunings.
# TODO: Rendering code in tunings.