
import re

class Compiler:
	def __init__(self,src,title = "unknown"):
		self.infoKeys = { "beats":"4","tempo":"100","title":title,"composer":"unknown", \
						  "version":"1","capo":"0","options":"" }

		Compiler.fretNames = "x0123456789tlwhuis"					# represents frets 0-16
		self.src = src 
		self.preProcess()
		self.bars = []
		# compile all lines
		for line in self.src:
			lineSource = [x.strip() for x in line.split("|") if x.strip() != ""]
			# compile all bars
			for barSrc in lineSource:
				bar = self.compileBar(barSrc)
				self.bars.append(bar)
	#
	#	Preprocess the source.
	#
	def preProcess(self):
		# strip spaces comments blank lines
		self.src = [x.replace("\t"," ").replace("\n"," ").replace("\r","") for x in self.src]
		self.src = [x if x.find("#") < 0 else x[:x.find("#")] for x in self.src]
		self.src = [x.strip().lower() for x in self.src if x.strip() != ""]

		# rip out all the a := b
		defines = {}
		for defn in [x for x in self.src if x.find(":=") >= 0]:
			def2 = [x.strip() for x in defn.split(":=")]
			assert len(def2[0]) > 0 and len(def2) == 2,"Bad definition "+defn
			defines[def2[0]] = def2[1]
		self.src = [x for x in self.src if x.find(":=") < 0]

		# create the type information object
		assert "type" in def2,"Missing instrument type definition"
		self.createInformationObject(defines["type"])
		self.infoObject.initialise()

		# load the defaults for instrument type in.
		self.infoObject.addDefaults(self.infoKeys)
		# load defines other than type which is a compiler directive in.
		del defines["type"]
		for key in defines.keys():
			self.infoKeys[key] = defines[key]
	#
	#	Compile a single bar
	#
	def compileBar(self,src):
		# tell info new bar
		self.infoObject.newBar()
		# strums go in here
		barElements = []
		# for each item in bar
		for item in [x.strip() for x in src.split(" ") if x.strip() != ""]:
			# figure out the time adjusting tail
			m = re.search("([o\-\=\.]*)$",item)
			lenInfo = m.group(1) if m is not None else ""
			# remove it if required
			if lenInfo != "":
				item = item[:-len(lenInfo)]
			# ask info to compile. Returns [#strings x frets] or None		
			strum = self.infoObject.compileStrum(item)
			if strum is not None:
				# work out the note length in qBeats
				qbLength = 4
				for c in lenInfo:
					if c == 'o':
						qbLength += 4
					elif c == '.':
						qbLength = int(qbLength * 3 / 2)
					elif c == '-':
						qbLength -= 2
					else:
						qbLength -= 3
				# add to strum
				strum.append(qbLength)
				# add to current bar elements
				barElements.append(strum)
		print(">>",src,barElements)
		return barElements
	#
	#	Create the support object
	#
	def createInformationObject(self,name):
		if name == "mandolin":
			self.infoObject = MandolinInfo()
		else:
			assert "Unsupported instrument type "+name


class MandolinInfo:
	#
	#	Add defaults - number of strings and tuning and options
	#
	def addDefaults(self,hash):
		hash["strings"] = str(self.getStringCount())
		hash["string0"] = "G3"
		hash["string1"] = "D4"
		hash["string2"] = "A4"
		hash["string3"] = "E5"
		hash["options"] = "mandolin"
	#
	#	First time used
	#
	def initialise(self):
		self.currentString = 0
	#
	#	Start of new bar
	# 
	def newBar(self):
		pass
	#
	#	Compile a strum in either n or nnnn format (e.g. single note or 4 notes)
	#	Can be preceded by ^ v (shift string this only) g d a e (shift string permanently)
	#
	def compileStrum(self,defn):
		initDef = defn
		cString = self.currentString
		# handle preceding shift ^ v gdae string switchers
		while defn != "" and ("^v"+self.getStringNames()).find(defn[0]) >= 0:
			if defn[0] == '^':
				cString += 1
			elif defn[0] == 'v':
				cString -= 1
			else:
				cString = self.getStringNames().find(defn[0])
				self.currentString = cString
			defn = defn[1:]
		# modifier only.
		if defn == "":
			return None

		m = re.match("^["+self.getFretNames()+"]+$",defn)
		assert m is not None and (len(defn) == 1 or len(defn) == 4),"Bad strum "+initDef
		# first try single note on current string
		if len(defn) == 1:
			fret = self.getFretNames().find(defn)-1
			assert fret >= 0, "Bad strum "+initDef
			strum = [ None ] * 4
			strum[cString] = fret			
		# full strum.
		else:
			strum = [Compiler.fretNames.find(x)-1 for x in defn]
		return strum

	def getFretNames(self):
		return Compiler.fretNames
	def getStringCount(self):
		return 4
	def getStringNames(self):
		return "gdae"

src = open("aunt_rhody.song").readlines()
c = Compiler(src)
