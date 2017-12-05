# ******************************************************************************************
# ******************************************************************************************
#
#										Music JSON
#
# ******************************************************************************************
# ******************************************************************************************

from exception import CompilerException

class MusicJSON:
	#
	#	Constructor.
	#
	def __init__(self,instrument,tuning,strings):
		self.bars = []
		self.settings = { "title":"","tempo":"100","beats":"4","composer":"","capo":"0" }
		self.settings["instrument"] = instrument.strip().lower()
		self.settings["tuning"] = tuning.strip().lower()
		self.strings = strings
	#
	#	Overwrite a setting.
	#
	def set(self,key,value):
		key = key.lower().strip()
		self.settings[key] = value.lower().strip()
	#
	#	Get a setting
	#
	def get(self,key):
		key = key.lower().strip()
		if key not in self.settings:
			raise CompilerException("Setting {0} unknown".format(key))
		return self.settings[key]
	#
	#	Add a new bar.
	#
	def addBar(self):
		self.bars.append([])
	#
	#	Set the lyric. This is put in as a note time of -1
	#
	def setLyric(self,lyric):			
		self.bars[-1].append([-1,"<"+lyric.lower().strip()+">"])
	#
	#	Add a strum. A strum is in final order, e.g. lowest string first.
	#	(for a Ukulele lowest string is G4, which isn't actually THE lowest)
	#	None is used for no strum.
	#
	def addStrum(self,strum,qbPosition,chord=""):
		# make a copy an check length
		strum = [x for x in strum]
		if len(strum) > self.strings:
			raise CompilerException("Too many fret values")
		# item is [qbtime,chord,s1,s2,s3....] which means lyric is first.
		strum.insert(0,chord.lower().strip())
		strum.insert(0,qbPosition)
		# check that there isn't a note at this time already.
		for s in self.bars[-1]:
			if s[0] == qbPosition:
				raise CompilerException("Two notes in same time quarterbeat")
		# add to current strum				
		self.bars[-1].append(strum)
		# check range.
		#print(qbPosition,self.settings)
		if qbPosition >= int(self.settings["beats"]) * 4:
			raise CompilerException("Bar overflow")
		#print(strum)
	#
	#	Sort all the strums in a bar. We can't assume they come in in order
	# 	though they probably will !
	#
	def sortStrums(self,bar):
		bar.sort(key = lambda x:x[0])
	#
	#	Render as JSON string
	#
	def render(self):
		# sort all bars into order
		for b in self.bars:
			self.sortStrums(b)
		# add all the settings
		render = "{\n"+"\n".join(['"{0}":"{1}",'.format(x,self.settings[x]) for x in self.settings.keys()])
		render = render+'\n"bars":[\n'
		# add all the bars
		render = render + ",\n".join(['    "'+self.renderBar(x)+'"' for x in self.bars])
		return render+"\n]\n}"		
	#
	#	Render a bar
	#
	def renderBar(self,contents):
		if len(contents) == 0:
			return ""
		render = ""
		# is there lyrics ?
		if contents[0][0] == -1:
			render = contents[0][1]
			contents = contents[1:]
		if len(contents) == 0:
			return render
		# is there a space to the first note ? If so, pad with rest.
		if contents[0][0] != 0:
			rest = [ None ] * self.strings
			rest.insert(0,0)
			contents.insert(0,rest)
		# now render each one in turn.
		for n in range(0,len(contents)):
			if render != "":
				render = render + ";"
			# strums
			item = "".join([self.map(x) for x in contents[n][2:]])
			# chord if present
			if contents[n][1] != "":
				item = item+"["+contents[n][1]+"]"
			# how long it is in quarterbeats
			render = render + item + ","
			# next one is time of next or end of bar.
			nextTime = contents[n+1][0] if n < len(contents)-1 else int(self.settings["beats"],10)*4
			render = render + "{0:02}".format(nextTime-contents[n][0])
			#print(item,contents[n],render)
		return render
	#
	#	Map a fret to a letter or .
	#
	def map(self,fretNo):
		return chr(fretNo+97) if fretNo is not None else '-'

if __name__ == '__main__':
	c = MusicJSON("loog","g3,b3,e4",3)
	for n in range(0,4):
		#print("-------------	")
		c.addBar()
		c.setLyric("Line # "+str(n+1))
		for s in range(0,3+n):
			c.addStrum([n,s+1,s],0+s*2,chr(s+65)+"m" if s != 2 else "")
		c.addStrum([None,None,None],(4+n)*2)
	print(c.render())		


