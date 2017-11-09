# ****************************************************************************************
# ****************************************************************************************
#
#								Seagull Merlin Compiler
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
	def __init__(self,strumDef):
		# rests to x
		strumDef = "x" if strumDef == "&" else strumDef
		# validate format
		m = re.match("^([0-7x]+)([o\.\-\=]*)$",strumDef)
		if m is None:
			raise CompilerException("Unknown strum '"+strumDef+"'")
		# convert
		self.strums = self.createStrums(m.group(1))
		self.twLength = self.calculateLength(m.group(2))
		#print(strumDef,self.strums,self.twLength)

	def createStrums(self,strums):
		# pad with x
		strums = ("xxxx"+strums)[-3:]
		strums = [None if x == "x" else int(x) for x in strums]
		return strums

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
			if lm == '=':
				twLength = int(twLength * 3 / 2)
		return twLength 

	def render(self):
		render = "".join([self.fretRender(x) for x in self.strums])
		render = render + "{0:02}".format(self.twLength)
		return render

	def fretRender(self,s):
		if s is None:
			return "-"
		return chr(Strum.fretMapping[s]+97)

Strum.fretMapping = [	0, 	2,	4,	5,	7,	9,	11,	12 ]
#						D 	E 	F# 	G 	A 	B 	C# 	D

# ****************************************************************************************
#									  Bar object
# ****************************************************************************************

class Bar:
	def __init__(self,barDef,beats):
		self.strums = []
		for strDef in [x.strip() for x in barDef.split(" ") if x.strip() != ""]:
			self.strums.append(Strum(strDef))
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

class Compiler:
	def __init__(self,source,target):
		# preprocess
		self.loadFile(source)
		self.createKeys(source)
		# compile bar data
		self.bars = []
		for srcLine in self.src:
			for barSrc in [x.strip() for x in srcLine.split("|") if x.strip() != ""]:
				self.bars.append(Bar(barSrc,int(self.infoKeys["beats"])))
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
		self.src = [x if x.find("#") < 0 else x[:x.find("#")] for x in self.src]
		self.src = [x.strip() for x in self.src if x.strip() != ""]

	def createKeys(self,source):
		# set up default keys.
		self.infoKeys = { "strings":"3", \
						  "string0": "d3", "string1":"a3","string2":"d4", \
						  "beats":"4","tempo":"100","composer":"unknown", \
						  "version":"1","capo":"0","options":"merlin" }		
		# calculate title						  
		title = source.lower().replace("_"," ").replace("-"," ").replace(".merlin","")
		if title.find("/") >= 0:
			title = title.split("/")[-1]
		self.infoKeys["title"] = title
		# update any key values, then remove them.
		for assign in [x for x in self.src if x.find(":=") >= 0]:
			assign = [x.strip() for x in assign.split(":=")]
			self.infoKeys[assign[0]] = assign[1]
		self.src = [x for x in self.src if x.find(":=") < 0]

	def writeInfoKeys(self,target):
		# get list of keys in alphabetical order.
		k = [x for x in self.infoKeys.keys()]
		k.sort()
		for key in k:
			target.write('    "{0}":"{1}",\n'.format(key,self.infoKeys[key]))

c = Compiler("./happy_birthday.merlin","../app/music.json")
