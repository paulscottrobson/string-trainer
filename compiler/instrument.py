# ****************************************************************************************
# ****************************************************************************************
#
#						Analyse song for transposition/tuning
#
# ****************************************************************************************
# ****************************************************************************************

import song

class BaseInstrument:
	def __init__(self,tuningOffset = None):
		self.stringNotes = []		
		fretChromaticList = self.getChromaticOffsets()
		self.topFret = fretChromaticList[-1]
		self.baseNotes = []

		for s in range(0,self.getStringCount()):
			notes = {}
			baseNote = song.Note.toIndex(self.getBaseTuning()[s])
			if tuningOffset is not None:
				baseNote = baseNote + tuningOffset[s]
			self.baseNotes.append(baseNote)
			for n in fretChromaticList:
				notes[baseNote+n] = n
			self.stringNotes.append(notes)

	def getTuning(self):
		return ",".join([song.Note.toName(x) for x in self.baseNotes])
	#
	#	Figure out what string to use. usageResult is -1 (bend needed) and -2 (not possible)
	#
	def __examineNoteString(self,noteID):
		self.usageResult = -1
		self.selectedString = -1
		for s in range(0,self.getStringCount()):
			if noteID in self.stringNotes[s]:
				self.selectedString = s 
				self.usageResult = s
		if self.usageResult < 0:
			self.usageResult = -2
			for s in range(0,self.getStringCount()):
				if noteID >= self.baseNotes[s] and noteID <= self.baseNotes[s]+self.topFret:
					self.selectedString = s
					self.usageResult = -1
	#
	#	Get the score for the note on this instrument.
	#
	def getNoteScore(self,noteID):
		self.__examineNoteString(noteID)
		if self.usageResult == -2:
			return -999999
		elif self.usageResult == -1:
			return self.getStringBendScores()[0]
		else:
			return self.getStringBendScores()[self.selectedString+1]
	#
	#	Return the string number, and the base note for the string.
	#
	def getStringInformation(self,noteID):
		self.__examineNoteString(noteID)
		if self.usageResult == -2:
			return [-2,None]
		return [ self.selectedString ,self.baseNotes[self.selectedString] ]
	#
	#	Return the textual name of the string.
	#
	def getStringName(self,noteID):
		self.__examineNoteString(noteID)
		if self.usageResult == -2:
			return "impossible"
		elif self.usageResult == -1:
			return self.getStringUsageNames()[self.selectedString]+".bent"
		else:
			return self.getStringUsageNames()[self.selectedString]
	#
	#	Convert chromatic to fret#
	#
	def toFret(self,chromID):
		fretChromaticList = self.getChromaticOffsets()
		for n in range(0,len(fretChromaticList)):
			if fretChromaticList[n] == chromID:
				return n
			if n > 0:
				if fretChromaticList[n-1]+1 == chromID:
					return n-1+0.5
		assert False


class MerlinInstrument(BaseInstrument):
	def getStringCount(self):
		return 3
	def getStringUsageNames(self):
		return ["bass","middle","melody"]
	def getStringBendScores(self):
		return [-1000,10,50,500]
	def getBaseTuning(self):
		return ["D3","A3","D4"]
	def getChromaticOffsets(self):
		return [ 0,   2,  4, 5,   7,   9,  11, 12 ]
		#		 D D# E F F# G G# A A# B C C#  D
	def getOptions(self):
		return "merlin"
