#!/usr/bin/python
# -*- coding: utf-8 -*-
import requests
import sys
import optparse


# To run, im cmd paste --> python api.py --app_id 5ed84734 --app_key fb1ef20925bb1ad66d7a874fd0eab80b

def callPublicFlightAPI(options):
    url = 'https://api.schiphol.nl/public-flights/flights'

    headers = {
      'accept': 'application/json',
	  'resourceversion': 'v4',
      'app_id': options.app_id,
	  'app_key': options.app_key
	}

    try:
        response = requests.request('GET', url, headers=headers)
    except requests.exceptions.ConnectionError as error:
        print("NOPE")
        print(error)
        sys.exit()

    if response.status_code == 200:
        flightList = response.json()
        print('found {} flights.'.format(len(flightList['flights'])))
        for flight in flightList['flights']:
            print('Found flight with name: {} scheduled on: {} at {}'.format(
                flight['flightName'],
                flight['scheduleDate'],
                flight['scheduleTime']))
    else:
        print('''Oops something went wrong
Http response code: {}
{}'''.format(response.status_code,
             response.text))

if __name__ == '__main__':
    parser = optparse.OptionParser()
    parser.add_option('-i', '--app_id', dest='app_id',
                      help='App id used to call the API')
    parser.add_option('-k', '--app_key', dest='app_key',
                      help='App key used to call the API')

    (options, args) = parser.parse_args()
    if options.app_id is None:
        parser.error('Please provide an app id (-i, --app_id)')

    if options.app_key is None:
        parser.error('Please provide an app key (-key, --app_key)')

    callPublicFlightAPI(options)
