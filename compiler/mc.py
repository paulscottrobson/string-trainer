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
import re

class MusicCompiler:
	#
	#	Compile a single piece of music.
	#
	def compile(self,sourceFile):
		print("Compiling "+sourceFile)
		self.sourceFile = sourceFile
		self.lineNumber = 0
		self.fretMapping = "0123456789tvwhuisv"
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
		# Scan every line
		for n in range(0,len(self.src)):
			self.lineNumber = n + 1
			if self.src[n].find(":=") < 0 and self.src[n] != "":
				# split into bars
				for barDef in [x.strip() for x in self.src[n].split("|") if x.strip() != ""]:
					self.compileBar(barDef)
	#
	#	Preprocess file, tabs, returns, spaces, comments 
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
	#	Find instrument being used and create instance of it.
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
	#	Copy overriding settings.
	#
	def processSettings(self):
		self.musicjson.set("instrument",self.instrument.getShortName())
		self.musicjson.set("tuning",self.instrument.getDefaultTuning())
		for item in [x for x in self.src if x.find(":=") >= 0]:
			item = [x.strip() for x in item.split(":=")]
			self.musicjson.set(item[0],item[1])
	#
	#	Get number of beats/bar
	#
	def getBeats(self):
		return int(self.musicjson.get("beats"),10)
	#
	#	Compile a single bar
	#
	def compileBar(self,barDef):
		# add a new empty bar
		self.musicjson.addBar()
		# remove lyrics "hi" and strum pattens {xxxx}
		barDef = self.lyricsAndStrumPatterns(barDef)
		# remove chords and generate if there are any [Dm:2]
		barDef = self.processChords(barDef)
		# convert rests (&) to xxx
		barDef = barDef.replace("&","x"*self.instrument.getStringCount()).strip()
		# Process items one at a time.
		self.barPosition = 0
		for item in barDef.split(" "):
			if item != "":
				self.compileItem(item)
	#
	#	Compile an item. All we (should) have left are Strums.
	#				
	def compileItem(self,itemDef):
		# check matches the syntax
		m = re.match("^(["+self.fretMapping+"x\^]+)([o\.\-\=]*)$",itemDef)		
		if m is None:
			raise CompilerException("Cannot process "+itemDef)
		# get strum part
		strum = self.convertToStrum(m.group(1))
		# get length part
		qbLength = self.convertToQBLength(m.group(2))
		# write to bar
		self.musicjson.addStrum(strum,self.barPosition)
		self.barPosition += qbLength
		#print(itemDef,strum,qbLength)
	#
	#	Convert strum text to a strum list.
	#
	def convertToStrum(self,strumDef):
		strum = []
		# while more to process
		while strumDef != "":
			# No strum (x)
			if strumDef[0] == 'x':
				strum.append(None)
				strumDef = strumDef[1:]
			else:
				# Strum 0-9 etc.
				if self.fretMapping.find(strumDef[0]) < 0:
					raise "No such fret position "+strumDef[0]
				# Get chromatic offset from fret number.
				fretID = self.fretMapping.find(strumDef[0])
				#print(strumDef[0],fretID)
				strum.append(self.instrument.fretToChromatic(fretID))
				strumDef = strumDef[1:]
				# Handle + (e.g. 6+ on dulcimer)
				if strumDef != "" and strumDef[0] == '+':
					strum[-1] += 1
					strumDef = strumDef[1:]
				# Handle ^ (bend)
				if strumDef != "" and strumDef[0] == '^':
					strum[-1] += 1
					strumDef = strumDef[1:]
		# check length, not more strums than strings !
		if len(strum) > self.instrument.getStringCount():
			raise CompilerException("Too many strums")
		# pad out and fix it so lowest string first.
		while len(strum) < self.instrument.getStringCount():
			strum.append(None)
		strum.reverse()
		return strum
	#
	#	Convert length modifiers to a quarterbeatTime
	#
	def convertToQBLength(self,modifiers):
		qbLength = 4
		for m in modifiers:
			if m == 'o':
				qbLength += 4
			if m == '.':
				qbLength = int(qbLength*3/2)
			if m == '-':
				qbLength -= 2
			if m == '=':
				qbLength -= 3
		return qbLength
	#
	#	Process chords.
	#
	def processChords(self,barDef):
		# start with repeating the last chord.
		chords = [self.currentChord] * self.getBeats()
		# extract out chords.
		m = re.search("\[(.*?)\]",barDef)
		# while more to extract
		while m is not None:
			# remove from definition			 
			barDef = barDef.replace(m.group(0)," ")
			cInfo = m.group(1)
			# add default :1
			cInfo = cInfo if cInfo.find(":") >= 0 else cInfo+":1"
			# if turning off make chord "x"
			cInfo = cInfo if cInfo[0] != ':' else "x"+cInfo
			# split into chord and position
			cInfo = cInfo.split(":")
			# fill from there to the end of the bar with the chord.
			for pos in range(int(cInfo[1])-1,self.getBeats()):
				chords[pos] = cInfo[0] if cInfo[0] != 'x' else None
			# look again.			
			m = re.search("\[(.*?)\]",barDef)
		# convert chords to actual chord definitions.
		xchords = [ None ] * self.getBeats()
		for i in range(0,len(chords)):
			if chords[i] is not None:
				# Get chord from settings.
				key = "chord."+chords[i]
				xchords[i] = [int(x) for x in self.musicjson.get(key)]
				# Convert to chromatic strum as these are fret numbers.
				xchords[i] = [self.instrument.fretToChromatic(x) for x in xchords[i]]
		#print(xchords)
		# check every half beat
		for halfBeat in range(0,self.getBeats()*2):
			# see if there is a strum there
			c = self.strumPattern[halfBeat]
			if not(c == '_' or c == '.' or c == '-' or c == ' '):
				# check there is a chord in that half beat
				ch = xchords[int(halfBeat/2)]
				# if so, add to bar.
				if ch is not None:
					self.musicjson.addStrum(ch,halfBeat*2,chords[int(halfBeat/2)])					
		# the last chord is the first chord next time.
		self.currentChord = chords[-1]
		return barDef
	#
	#	Extract lyrics and strum patterns out.
	#
	def lyricsAndStrumPatterns(self,barDef):
		# Look for lyrics.
		m = re.search('\"(.*?)\"',barDef)
		if m is not None:
			# remove in def
			barDef = barDef.replace(m.group(0)," ")
			# add to this bar
			self.musicjson.setLyric(m.group(1).lower())
			# check only one.
			if barDef.find('"') >= 0:
				raise CompilerException("Only one lyric per bar")
		# Extract strum patterns
		m = re.search('\{(.*?)}',barDef)
		if m is not None:
			# remove in def
			barDef = barDef.replace(m.group(0)," ")
			# set current
			self.strumPattern = m.group(1).lower()
			if len(self.strumPattern) != self.getBeats()*2:
				raise CompilerException("Bad strum pattern "+m.group(0))
			#print(self.strumPattern)
			# check no more
			if barDef.find('{') >= 0:
				raise CompilerException("Only one strum pattern per bar")
		return barDef
	#
	#	Write result file.
	#
	def write(self,targetFile):
		h = open(targetFile,"w")
		h.write(self.musicjson.render())
		h.close()

if __name__ == '__main__':
	mc = MusicCompiler()
	mc.compile("good-king-wenceslas.music")			# music only, no chords, uke
	mc.write("../app/music1.json")
	mc.compile("let-it-be.music") 					# chords and lyrics only, loog
	mc.write("../app/music2.json")

	#print(instruments.InstrumentFactory().get("merlin"))
	mc.compile("silent-night.ukulele")				# chords, music, lyrics, merlin
	mc.write("../app/music.json")
