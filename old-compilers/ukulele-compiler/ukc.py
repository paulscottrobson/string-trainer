#
#	A very basic compiler for Ukulele music. Everything defaults except the actual
#	music (obviously).
#
#	Note data is up to  4 digit note, or x, in top down GCEA order, padded with x
#	using - = . o standard modifiers/
#	
import sys,re

class Compiler:
	def __init__(self):
		self.infoKeys = { "strings":"4", \
						  "string0": "G4", "string1":"C4","string2":"E4","string3":"A4", \
						  "beats":"4","tempo":"100","title":"","composer":"unknown", \
						  "version":"1","capo":"0" }

	def compile(self,sourceFile,targetFile = None):
		self.infoKeys["title"] = sourceFile
		self.bars = [ ]
		src = [x.replace("\t"," ") for x in open(sourceFile).readlines()]
		src = [x.strip().lower() for x in src if x.strip() != ""]
		src = [x for x in src if x[0] != '#']
		for s in src:
			for bs in s.split("|"):
				if bs.strip() != "":
					bar = self.compileBar(bs)
					self.bars.append(bar)

		target = sys.stdout if targetFile is None else open(targetFile,"w")		
		self.render(target)
		if targetFile is not None:
			target.close()

	def compileBar(self,bDef):
		notes = [x.strip() for x in bDef.split(" ") if x.strip() != ""]
		notes = [self.compileNote(x) for x in notes]
		return ";".join(notes)

	def convertNote(self,note):
		if note >= "0" and note <= "9":
			return chr(int(note)+97)
		return chr(ord(note)-ord('a')+10+97)

	def compileNote(self,nDef):
		m = re.match("^([0-9a-nx]+)([\-o\.\=]*)$",nDef)
		assert m is not None,"Note unknown "+nDef
		# reverse, justify, split up
		notes = [x for x in ("xxxx"+(m.group(1)[::-1]))[-4:]]
		# convert from x digit to - letter format
		notes = ["-" if x == "x" else self.convertNote(x) for x in notes]
		# work out note length in quarterbeats
		qb = 4
		for mod in m.group(2):
			if mod == 'o':
				qb = qb + 4
			elif mod == ".":
				qb = int(qb * 3 / 2)
			elif mod == "-":
				qb = int(qb / 2)
			else:
				qb = int(qb / 4)
		# reconstruct and exit.
		return "".join(notes)+"{0:02}".format(qb)

	def render(self,target):
		target.write("{\n")
		ik = [x for x in self.infoKeys.keys()]
		ik.sort()
		for k in ik:
			target.write('"{0}":"{1}",\n'.format(k,self.infoKeys[k].lower()))
		target.write('"bars":[\n')
		target.write(",\n".join(['    "'+x+'"' for x in self.bars]))
		target.write('\n]}\n')

cm = Compiler()
cm.compile("test.usong")
cm.compile("test.usong","../app/music.json")