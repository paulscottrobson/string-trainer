# ****************************************************************************************
# ****************************************************************************************
#
#							Set of classes encapsulates a song
#
# ****************************************************************************************
# ****************************************************************************************

import re,cm

# ****************************************************************************************
# 									A single note
# ****************************************************************************************

class Note:
	def __init__(self,notedef,accidentals):
		# check syntax
		m = re.match("^([a-gA-G\&][\#\\b\\~]?)([\-\=o\.]*)$",notedef)
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
		if note[-1] == '~':
			note = note[:-1]			
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

	def render(self,instrument,transpose,noteInfo):
		if self.noteID == -1:
			return "&"+self.lengthInfo
		trNote = self.noteID + transpose
		assert trNote in noteInfo
		strID = noteInfo[trNote]["string"]
		trNote = trNote - noteInfo[trNote]["basenote"]
		diNote = instrument.toFret(trNote)
		itemLetter = (instrument.getStringCount()-1-strID) * "x"
		itemLetter = itemLetter + cm.Strum.fretID[int(diNote)]
		return itemLetter+self.lengthInfo

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

	def render(self,instrument,transpose,noteInfo):
		render = []
		for note in self.notes:
			render.append(note.render(instrument,transpose,noteInfo))			
		return " ".join(render)

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


	def render(self,targetFile,instrument,transpose,noteInfo):
		h = open(targetFile,"w")
		self.keys["options"] = instrument.getOptions()
		self.keys["strings"] = str(instrument.getStringCount())
		for s in range(0,instrument.getStringCount()):
			self.keys["string"+str(s)] = instrument.getTuning().split(",")[s]
		klist = [x for x in self.keys]
		klist.sort()
		for k in klist:
			h.write("{0} := {1}\n".format(k,self.keys[k]))
		h.write("\n")
		rbars = []
		for bar in self.bars:
			rbars.append(bar.render(instrument,transpose,noteInfo))
		h.write("\n".join(rbars))
		h.close()	

if __name__ == '__main__':
	x = Song("here-comes-the-sun.song")
	print(x.analyse(0))
