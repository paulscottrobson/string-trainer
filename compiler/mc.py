# ******************************************************************************************
# ******************************************************************************************
#
#									Music Compiler
#
# ******************************************************************************************
# ******************************************************************************************

from musicjson import MusicJSON
from exception import CompilerException
import instruments

class MusicCompiler:
	#
	#	Compile a single piece of music.
	#
	def compile(self,sourceFile):
		self.sourceFile = sourceFile
		self.lineNumber = 0
		# Read and tidy
		self.preProcess()
		# Figure out instrument, create json store
		self.getInstrument()
		self.musicjson = MusicJSON(self.instrument.getShortName(),		\
								   self.instrument.getDefaultTuning(),	\
								   self.instrument.getStringCount())
		# Process all the settings.
		self.processSettings()
		# Current chord and strum pattern.
		self.currentChord = None
		self.strumPattern = "d-" * self.getBeats()
		print(self.strumPattern)
		# Scan every line
		for n in range(0,len(self.src)):
			self.lineNumber = n + 1
			if self.src[n].find(":=") < 0 and self.src[n] != "":
				# split into bars
				for barDef in [x.strip() for x in self.src[n].split("|") if x.strip() != ""]:
					self.compileBar(barDef)
	#
	#	Preprocess file
	#
	def preProcess(self):
		# read in files
		self.src = open(self.sourceFile).readlines()
		# tab return lower case
		self.src = [x.replace("\t"," ").replace("\n"," ").lower() for x in self.src]
		# comments out
		self.src = [x if x.find("//") < 0 else x[:x.find("//")] for x in self.src]
		# strip finally
		self.src = [x.strip() for x in self.src]
	#
	#	Find instrument and create instance of it.
	#
	def getInstrument(self):
		# find things with := and instrument
		inst = [x for x in self.src if x.find(":=") >= 0 and x[:10] == "instrument"]
		# should only be one
		if len(inst) != 1:
			raise CompilerException("Cannot identify playing instrument")
		# get name
		inst = inst[0][inst[0].find(":=")+2:].strip()
		# and create one.
		self.instrument = instruments.InstrumentFactory().get(inst)
	#
	#	Do settings
	#
	def processSettings(self):
		self.musicjson.set("instrument",self.instrument.getShortName())
		self.musicjson.set("tuning",self.instrument.getDefaultTuning())
		for item in [x for x in self.src if x.find(":=") >= 0]:
			item = [x.strip() for x in item.split(":=")]
			self.musicjson.set(item[0],item[1])
	#
	#	Get number of beats
	#
	def getBeats(self):
		return int(self.musicjson.get("beats"),10)
	#
	#	Compile a single bar
	#
	def compileBar(self,barDef):
		self.musicjson.addBar()
		# Extract lyrics
		# Extract strum patterns
		# Set up beat chords with lastchords
		# Process items one at a time.
		# Create strums with chords and string patterns

if __name__ == '__main__':
	mc = MusicCompiler()
	mc.compile("good-king-wenceslas.music")			# music only, no chords
	print(mc.musicjson.render())
	#mc.compile("oh danny boy.music")				# chords, music, lyrics
	#mc.compile("let-it-be.music") 					# chords and lyrics only.

	#print(instruments.InstrumentFactory().get("merlin"))
