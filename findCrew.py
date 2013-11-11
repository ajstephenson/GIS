import sys, os

# make one appended target file containing a crew member on each line
print "Looping through sets\n"
with open('allcrews.txt', 'w') as outfile:
	print "Writing to crewlist.txt\n"
	with open('allsets.txt', 'r') as infile:
		crewString = str()
		crewSet = set()
		lineCount = 0
		for line in infile:
			lineCount = lineCount + 1
			if lineCount == 1:
				continue
			else:
				# convert the string into a list (array)
				record = line.split(',')
				# pull the set crew and pull crew from the list and append them to the big crew string
				crewString = crewString + " " + record[8].lower() + " " + record[9].lower()
		# get a collection of distinct crew members
		crewList = crewString.split(' ')
		crewList.sort()
		for person in crewList:
			if person == "":
				continue
			if person not in crewSet:
				crewSet.add(person)
		crewSetSorted = sorted(crewSet)
		for person in crewSetSorted:
			personCount = crewList.count(person)
			#outfile.write(person + " " + str(personCount) + "\n")
			outfile.write(person + "\n")
			print "Found " + person + " " + str(personCount) + " times\n"
		print str(lineCount) + " lines read.\n"
		print str(len(crewSetSorted)) + " crew members found.\n"
	infile.close()
	sys.stdout.flush()
outfile.close()