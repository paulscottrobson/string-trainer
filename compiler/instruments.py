# ******************************************************************************************
# ******************************************************************************************
#
#								Instrument Classes
#
# ******************************************************************************************
# ******************************************************************************************

class BaseInstrument:

	def compile(self):
		# Basic Info
		defn =  [ self.getShortName(),self.getName(),self.getDefaultTuning(), \
					str(self.getStringCount()),"y" if self.isTabInverted() else "n"]
		# Doubled Strings display
		for s in range(0,self.getStringCount()):
			defn.append("D" if self.isStringDoubled(s) else "S")
		# Name = Chromatic offset for every Fret.
		n = 0
		while(self.getFretInfo(n) is not None):
			fi = self.getFretInfo(n)
			n = n + 1
			defn.append(fi[0]+"="+str(fi[1]))
		# Put them together in a string
		return ".".join(defn)

	def fretToChromatic(self,fret):
		return self.getFretInfo(fret)[1]

	def isStringDoubled(self,str):
		return False

# ******************************************************************************************
#								  Seagull MERLIN
# ******************************************************************************************

class Merlin(BaseInstrument):
	def getName(self):
		return "Seagull Merlin"
	def getShortName(self):
		return "merlin"
	def getStringCount(self):
		return 3
	def getDefaultTuning(self):
		return "d3,a3,d4"
	def getFretInfo(self,fretNumber):
		return None if fretNumber > 7 else [str(fretNumber),Merlin.FRETS[fretNumber]]
	def isTabInverted(self):
		return False 
	def isStringDoubled(self,str):
		return str == 2

Merlin.FRETS = 	[	0,	2,	4,	5,	7,	9, 	11, 12 ]		
#					D 	E 	F# 	G 	A 	B 	C# 	D

# ******************************************************************************************
#									Strumstick.
# ******************************************************************************************

class Strumstick(Merlin):
	def getName(self):
		return "McNally Strumstick"
	def getShortName(self):
		return "strumstick"
	def getFretInfo(self,fretNumber):
		if fretNumber > 14:
			return None
		return [str(fretNumber),Strumstick.FRETS[fretNumber%8]+12*int(fretNumber/8)]

Strumstick.FRETS = 	[	0,	2,	4,	5,	7,	9, 	10,	11, 12 ]		
#						D 	E 	F# 	G 	A 	B 	C 	C# 	D

# ******************************************************************************************
#									Mountain Dulcimer
# ******************************************************************************************

class MountainDulcimer(Merlin):
	def getName(self):
		return "Mountain Dulcimer"
	def getShortName(self):
		return "dulcimer"
	def getFretInfo(self,fretNumber):
		if fretNumber > 16:
			return None				
		name = str(min(6,fretNumber % 8) + int(fretNumber/8) * 7)
		if (fretNumber == 7 or fretNumber == 15):
			name += "+"
		return [name,Strumstick.FRETS[fretNumber%8]+12*int(fretNumber/8)]
	def isTabInverted(self):
		return True

# ******************************************************************************************
#								  	Loog Guitar
# ******************************************************************************************

class Loog(BaseInstrument):
	def getName(self):
		return "Loog Guitar"
	def getShortName(self):
		return "loog"
	def getStringCount(self):
		return 3
	def getDefaultTuning(self):
		return "g3,b3,e4"
	def getFretInfo(self,fretNumber):
		return None if fretNumber > 18 else [str(fretNumber),fretNumber]
	def isTabInverted(self):
		return False 

# ******************************************************************************************
#								  	Mandolin
# ******************************************************************************************

class Mandolin(BaseInstrument):
	def getName(self):
		return "Mandolin"
	def getShortName(self):
		return "mandolin"
	def getStringCount(self):
		return 4
	def getDefaultTuning(self):
		return "g3,d4,a4,e5"
	def getFretInfo(self,fretNumber):
		return None if fretNumber > 18 else [str(fretNumber),fretNumber]
	def isTabInverted(self):
		return False 		
	def isStringDoubled(self,str):
		return True

# ******************************************************************************************
#								  	Ukulele (Standard)
# ******************************************************************************************

class Ukulele(BaseInstrument):
	def getName(self):
		return "Ukulele"
	def getShortName(self):
		return "ukulele"
	def getStringCount(self):
		return 4
	def getDefaultTuning(self):
		return "g4,c4,e4,a4"
	def getFretInfo(self,fretNumber):
		return None if fretNumber > 14 else [str(fretNumber),fretNumber]
	def isTabInverted(self):
		return False 

# ******************************************************************************************
#							Return instrument of given type
# ******************************************************************************************

class InstrumentFactory:
	@staticmethod
	def get(name):
		if name == "merlin":
			return Merlin()
		if name == "strumstick":
			return Strumstick()
		if name == "dulcimer":
			return MountainDulcimer()
		if name == "loog":
			return Loog()
		if name == "ukulele":
			return Ukulele()
		if name == "mandolin":
			return Mandolin()
		raise Exception("Unknown instrument type "+name)
	@staticmethod
	def getList():
		return "merlin,ukulele,strumstick,dulcimer,loog,mandolin"
#
#	Note this creates the encoded instrument information.
#
if __name__ == '__main__':
	w = Loog()
	for i in range(0,20):
		print(i,w.getFretInfo(i))

	# Get list of the types
	types = InstrumentFactory.getList().split(",")
	# Create a list of all their definitions
	defList = []
	for t in types:
		defn = InstrumentFactory.get(t).compile()
		defList.append(defn)
	# make it into a long string
	defn = ":".join(defList)
	# convert it to typescript class
	classDef = 	'// AUTOMATICALLY GENERATED\n\n'
	classDef +=  'class InstrumentInfo {\n'
	classDef += 'public static encodedInfo:string = "'+defn+'";\n}\n'
	# which is written to /tmp
	h = open("/tmp/instrumentinfo.ts","w").write(classDef)
