import glob, sys, os

# get a list of files of sets, rss, and fish
print "Getting lists of files"
sets = glob.glob("*sets.txt")
rss = glob.glob("*rss.txt")
fish = glob.glob("*fish.txt")

# make a dictionary of target file names for each list of files
print "Making dictionary"
filetypes = [{'filename': 'allsets.txt', 'fileslist': sets},
	{'filename': 'allrss.txt', 'fileslist': rss},
	{'filename': 'allfish.txt', 'fileslist': fish}]
	
# make one appended target file for each unique file type
# containing all the data from the source files of each type
print "Looping through files\n"
for ft in filetypes:
	with open(ft['filename'], 'w') as outfile:
		print "Writing to " + ft['filename']
		filecount = 0
		headercount = 0
		for file in ft['fileslist']:
			filecount += 1
			# grab the lakeid from the file name
			lakeid = file[:2]
			# grab the header line from the file
			f = open(file)
			header = f.readline()
			f.close
			with open(file) as infile:
				for line in infile:
					if (line == header):
						headercount += 1
						# only print the header line once
						if (headercount == 1):
							# pre-pend a new column for lakeid
							outfile.write("lakeid," + header.replace(" ",""))
						# don't print any other header lines
						else:
							continue
					else:
						try:
							# remove full species names, leaving only their species codes (codes and names are separated by a hyphen, like this: YP-YELLOWPERCH)
							hyphenIndex = line.index('-')
							nextCommaIndex = line.index(',',hyphenIndex)
							line = line[:hyphenIndex] + line[nextCommaIndex:]
						except ValueError:
							pass
						# remove extraneous text from and pre-pend the lakeid to each data line
						outfile.write(lakeid + "," + line.replace("true","1").replace("TRUE","1").replace("false","0").replace("FALSE","0").replace(" - Seine","").replace(" - Crayfish Trap","").replace(" - Shocker","").replace(" - Fyke Net","").replace(" - Trammel Net","").replace(" - Gill Net","").replace(" - Crayfish Trap","").replace(" - Minnow Trap","").replace("AL - ","").replace("BM - ","").replace("CB - ","").replace("CR - ","").replace("SP - ","").replace("TB - ","").replace("TR - ","").replace("ME - ","").replace("MO - ","").replace("WI - ","").replace("FI - ","").replace("KE - ","").replace("WA - ","").replace(" - Scale","").replace(" - Kept","").replace(" - Stomach","").replace(".,",",").replace(" ,",","))
				outfile.write("\n")
			infile.close()
		filetype = ft['filename'].replace("all","").replace(".txt","").upper()
		print str(filecount) + " files found for the " + filetype + " file type.\n"
		sys.stdout.flush()
	outfile.close()
