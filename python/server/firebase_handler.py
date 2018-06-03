import pyrebase
import json
import urllib
import subprocess
import os.path, os
import time
from collections import OrderedDict
import pysftp
import ftplib
import atexit

config = {
	"apiKey": "###",
	"authDomain": "###",
	"databaseURL": "###",
	"storageBucket": "###"
  }


firebase = pyrebase.initialize_app(config)

db = firebase.database()
storage = firebase.storage()
files_under_analysis_ref = db.child("files_under_analysis")
all_under_process_ref = files_under_analysis_ref.child("all_under_process")
result = all_under_process_ref.get()

def analysisFinished(image_obj, user_id, img_name, key_main):
	# Save file
	time.sleep(4)

	#storage.child("files_done").child(user_id).child(img_name).put(img_name)
	#url = storage.child("files_done").child(user_id).child(img_name).get_url(None)'
	sess = ftplib.FTP('###', '###', '###')
	file = open(img_name, 'rb')
	sess.storbinary('STOR ' + img_name, file)
	file.close()
	sess.quit()
	print(img_name)

	image_obj['state'] = "ANALYZED"
	image_obj['name'] = img_name
	image_obj['downUrl'] = "###" + img_name

	# Save to files done
	new_post_ref = db.child("files_done").child(user_id).child(key_main)
	new_post_ref.set(image_obj)

	with open('pred-text.txt', 'r') as pred_file:
		json_pred = predFileToJson(pred_file.read())
		db.child("files_done").child(user_id).child(key_main).child("results").set(json_pred)

	# Delete previous data
	all_under_process = db.child("files_under_analysis").child("all_under_process").get()
	print(dict(all_under_process.val()))
	if result != None:
		for key, value in dict(all_under_process.val()).items():
			print("[KEY] (" + value.get('id') + ") : (" + key_main + ")")
			if value.get('id') == key_main:
				db.child("files_under_analysis").child("all_under_process").child(key).remove()
				db.child("files_under_analysis").child(user_id).child(key_main).remove()
				
				#firebase.delete('files_under_analysis/all_under_process', key)
				#firebase.delete('files_under_analysis/' + userId + '/', keyMain)

				print("[SUCCESS] Found that mofo!")
			else:
				print("[ERROR] Could not find file under process!")

		print("[SUCCESS] Files have been analysed and proccessed!")
	else:
		print("[ERROR] Could not save files...")

def streamHandler(files):
	# Server online status
	data = {"status": "online", "processing": True}
	db.child("server_stat").set(data)

	if files["data"] != None:
		for key, value in files["data"].items():
			if len(files["data"]) if key == "userId" else len(files["data"].get(key))  < 2:
				print("[WARN] Waiting for database to do its thing...")
			else:
				print(files["data"])
				user_id = files["data"].get('userId') if key == "userId" or key == "id" else files["data"].get(key).get('userId')
				id = files["data"].get('id') if key == "userId" or key == "id" else files["data"].get(key).get('id')

				image_ref = db.child("files_under_analysis").child(user_id).child(id)

				image_obj_get = image_ref.get()
				image_obj = dict(image_obj_get.val())

				# Variables to be declared
				get_img_url = image_obj.get('downUrl')
				img_name = image_obj.get('name')

				if os.path.isfile('data/' + img_name):
					print ('[WARN] Image (' + img_name + ') already exists in folder... Running on this file')
				else:
					urllib.urlretrieve(get_img_url, 'data/' + img_name)

				command = './darknet detect cfg/yolov3.cfg yolov3.weights data/' + img_name
				p = process = subprocess.Popen(command.split(), stdout=subprocess.PIPE)
				p.wait()

				name = os.path.splitext(img_name)[0]
				if os.path.isfile('predictions.png'):
					os.rename('predictions.png', name + '.png')
					print(image_obj)
					analysisFinished(image_obj, user_id, name + '.png', id)
				else:
					print('[WARN] Predictions file not located...')
	else:
		print('[INFO] Currently no files to process...')

detection_stream = db.child("files_under_analysis").child("all_under_process").stream(streamHandler, stream_id="files_to_analyze")

def predFileToJson(fileString):
	jsonDict = dict()
	for i in xrange(0, len(fileString.splitlines())):
		res = fileString.splitlines()[i]
		newLine = res.split()
		jsonDict.update({str(i) + ':' + newLine[1]: newLine[2]})

	return jsonDict