# ****************************************************************************************
# ****************************************************************************************
#
#						Analyse song for transposition/tuning
#
# ****************************************************************************************
# ****************************************************************************************

import song,instrument,cm

class Analyser:
	def __init__(self,song):
		self.song = song

	def analyse(self,transposition,instrument):
		noteUsage = self.song.analyse(transposition)
		self.noteInfo = {}
		self.instrument = instrument
		self.transposition = transposition
		self.noteCount = 0
		for note in noteUsage.keys():
			self.noteCount = self.noteCount + noteUsage[note]
			strInfo = instrument.getStringInformation(note)
			self.noteInfo[note] = { "note":note,										\
									"score":instrument.getNoteScore(note),				\
									"string":strInfo[0],								\
									"stringname":instrument.getStringName(note),		\
									"basenote":strInfo[1],								\
									"count":noteUsage[note] }
		#print(self.noteInfo)
		#print(self.noteCount)

	def report(self):
		notes = []
		nik = [x for x in self.noteInfo.keys()]
		nik.sort(key = lambda n:self.noteInfo[n]["note"])									
		for ki in nik:
			notes.append(self.explain(self.noteInfo[ki]))
		return notes

	def explain(self,ni):	
		exp = song.Note.toName(ni["note"])+" on "+ni["stringname"]
		if ni["string"] >= 0:
			exp = exp + "(+{0})".format(ni["note"]-ni["basenote"])
		exp = exp + "("+str(ni["count"])+")"
		return exp

	def score(self):
		score = 0
		for kinfo in self.noteInfo.keys():
			info = self.noteInfo[kinfo]
			score = score + info["score"] * info["count"]
		score = int(score / self.noteCount)
		return score

	def render(self,transpose,instrument,targetFile):
		self.analyse(transpose,instrument)
		self.song.render(targetFile,instrument,transpose,self.noteInfo)

analyser = Analyser(song.Song("here-comes-the-sun.song"))
for t1 in range(0,1):
	for t2 in range(0,1):
		merlin = instrument.MerlinInstrument([0,t1,t2])
		for transpose in range(-30,30):
			analyser.analyse(transpose,merlin)
			sc = analyser.score()
			if sc > 400:
				print("----------------------------------")
				print("Transpose:{0} Score:{1} Tuning:{2}".format(transpose,analyser.score(),merlin.getTuning()))
				print(analyser.report())

analyser.render(12,merlin,"./here-comes-the-sun.merlin")
cm.MerlinCompiler("./here-comes-the-sun.merlin","../app/music.json")