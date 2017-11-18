# ****************************************************************************************
# ****************************************************************************************
#
# ****************************************************************************************
# ****************************************************************************************

import re

# ****************************************************************************************
#									Error Exception
# ****************************************************************************************

class CompilerException(Exception):
	def __init__(self,msg):
		self.message = msg

# ****************************************************************************************
#							  Class representing a strum.
# ****************************************************************************************

class Strum:
	def __init__(self,strumDef,compiler):
		self.compiler = compiler
		# rests to x
		strumDef = "x"+strumDef[1:] if strumDef[0] == "&" else strumDef
		# validate format
		m = re.match("^(["+Strum.fretID+"x\^]+)([o\.\-\=]*)$",strumDef)
		if m is None:
			raise CompilerException("Unknown strum '"+strumDef+"'")
		# translate if needed.
		strum = self.compiler.translate(m.group(1))
		# convert
		self.strums = self.createStrums(strum)
		self.twLength = self.calculateLength(m.group(2))
		#print(strumDef,self.strums,self.twLength)

	def createStrums(self,strums):
		frettings = []
		while strums != "":
			frettings.append(None if strums[0] == 'x' else Strum.fretID.find(strums[0]))
			strums = strums[1:]
			if strums != "" and strums[0] == '^':
				frettings[-1] = frettings[-1] + 0.5
				strums = strums[1:]
		while len(frettings) < self.compiler.getStringCount():
			frettings.append(None)
		# pad with x
		frettings.reverse()
		return frettings

	def getLength(self):
		return self.twLength

	def calculateLength(self,lDef):
		twLength = 12
		for lm in lDef:
			if lm == 'o':
				twLength += 12
			if lm == '-':
				twLength -= 6
			if lm == '=':
				twLength -= 9
			if lm == '.':
				twLength = int(twLength * 3 / 2)
		return twLength 

	def render(self):
		render = "".join([self.fretRender(x) for x in self.strums])
		render = render + "{0:02}".format(self.twLength)
		return render

	def fretRender(self,s):
		if s is None:
			return "-"
		bend = 0 if s == int(s) else 1
		return chr(self.compiler.mapFret(int(s))+97+bend)

Strum.fretID = "0123456789tlwhuisv"				# represent frets 0-17


# ****************************************************************************************
#									  Bar object
# ****************************************************************************************

class Bar:
	def __init__(self,barDef,compiler,beats):
		self.strums = []
		for strDef in [x.strip() for x in barDef.split(" ") if x.strip() != ""]:
			self.strums.append(Strum(strDef,compiler))
		twLength = 0
		for str in self.strums:
			twLength = twLength + str.getLength()
		if twLength > beats * 12:
			raise CompilerException("Bar is too long '"+barDef+"'")
		if twLength < beats * 12:
			print("Warning bar not full '"+barDef+"'")

	def render(self):
		return ";".join([x.render() for x in self.strums])

# ****************************************************************************************
#										Compiler object
# ****************************************************************************************

class BaseCompiler:
	def __init__(self,source,target,tuning = ""):
		# preprocess
		self.loadFile(source)
		self.defaultKeys()
		self.createKeys(source,tuning)
		# compile bar data
		self.bars = []
		for srcLine in self.src:
			for barSrc in [x.strip() for x in srcLine.split("|") if x.strip() != ""]:
				self.bars.append(Bar(barSrc,self,int(self.infoKeys["beats"])))
		# output file, keys first
		target = open(target,"w")
		target.write("{\n")
		self.writeInfoKeys(target)
		# then bars
		target.write('    "bars":[\n')
		target.write(",\n".join(['        "'+x.render()+'"' for x in self.bars]))
		target.write("\n    ]\n}\n")
		target.close()

	def loadFile(self,source):
		# Load source file and pre-process
		self.src = [x.lower().replace("\t"," ").replace("\n"," ") for x in open(source).readlines()]
		self.src = [x if x.find("//") < 0 else x[:x.find("//")] for x in self.src]
		self.src = [x.strip() for x in self.src if x.strip() != ""]

	def createKeys(self,source,tuning):
		# update string number
		self.infoKeys["strings"] = str(self.getStringCount())
		# tuning override ?
		if tuning != "":
			self.setTuning(tuning)
		# calculate title						  
		title = source.lower().replace("_"," ").replace("-"," ")
		if title.find("/") >= 0:
			title = title.split("/")[-1]
		self.infoKeys["title"] = title if title.find(".") < 0 else title[:title.find(".")].strip()
		# update any key values, then remove them.
		for assign in [x for x in self.src if x.find(":=") >= 0]:
			assign = [x.strip() for x in assign.split(":=")]
			self.infoKeys[assign[0]] = assign[1]
		self.src = [x for x in self.src if x.find(":=") < 0]
		# tuning in keys ?
		if "tuning" in self.infoKeys:
			self.setTuning(self.infoKeys["tuning"])
			del self.infoKeys["tuning"]

	def setTuning(self,tuning):
		tuning = tuning.lower().split(",")
		if len(tuning) != self.getStringCount():
			raise CompilerException("Insufficient tuning for strings")
		for i in range(0,self.getStringCount()):
			self.infoKeys["string"+str(i)] = tuning[i]

	def writeInfoKeys(self,target):
		# get list of keys in alphabetical order.
		k = [x for x in self.infoKeys.keys()]
		k.sort()
		for key in k:
			target.write('    "{0}":"{1}",\n'.format(key,self.infoKeys[key]))

	def translate(self,strumDef):
		return strumDef

class MerlinCompiler(BaseCompiler):
	def getStringCount(self):
		return 3
	def mapFret(self,fret):
		return MerlinCompiler.fretMapping[fret]
	def defaultKeys(self):
		# set up default keys.
		self.infoKeys = { "string0": "d3", "string1":"a3","string2":"d4", \
						  "beats":"4","tempo":"100","composer":"unknown", \
						  "version":"1","capo":"0","options":"merlin" }		

MerlinCompiler.fretMapping = [	0, 	2,	4,	5,	7,	9,	11,	12 ]
#								D 	E 	F# 	G 	A 	B 	C# 	D

class DAAConverterCompiler(MerlinCompiler):
	def translate(self,strumDef):
		n = int(strumDef) - 3
		return str(n) if n >= 0 else "x"+str(n+3	)

class UkuleleCompiler(BaseCompiler):
	def getStringCount(self):
		return 4
	def mapFret(self,fret):
		return fret
	def defaultKeys(self):
		# set up default keys.
		self.infoKeys = { "string0": "g4", "string1":"c4","string2":"e4","string3":"a4",
						  "beats":"4","tempo":"100","composer":"unknown", \
						  "version":"1","capo":"0","options":"ukulele" }		



if __name__ == '__main__':
	c = UkuleleCompiler("zaw/in-the-bleak-midwinter.ukulele","../app/music/zawcarols/in-the-bleak-midwinter.json")
	c = UkuleleCompiler("zaw/i-saw-three-ships.ukulele","../app/music/zawcarols/i-saw-three-ships.json")
	c = UkuleleCompiler("zaw/sans-day-carol.ukulele","../app/music/zawcarols/sans-day-carol.json")
	c = UkuleleCompiler("zaw/good-king-wenceslas.ukulele","../app/music/zawcarols/good-king-wenceslas.json")
	c = UkuleleCompiler("zaw/silent-night.ukulele","../app/music/zawcarols/silent-night.json")
	c = UkuleleCompiler("zaw/sussex-carol.ukulele","../app/music/zawcarols/sussex-carol.json")
	c = UkuleleCompiler("zaw/tomorrow-shall-be-my-dancing-day.ukulele","../app/music/zawcarols/tomorrow-shall-be-my-dancing-day.json")
	c = UkuleleCompiler("zaw/we-three-kings.ukulele","../app/music/zawcarols/we-three-kings.json")
	c = UkuleleCompiler("zaw/sugar-plum-fairies.ukulele","../app/music/zawcarols/sugar-plum-fairies.json")
	c = UkuleleCompiler("zaw/troike.ukulele","../app/music/zawcarols/troike.json")
	
#	c = MerlinCompiler("./happy_birthday.merlin","../app/music.json")
	c = DAAConverterCompiler("./brother-john.daa","../app/music.json")
