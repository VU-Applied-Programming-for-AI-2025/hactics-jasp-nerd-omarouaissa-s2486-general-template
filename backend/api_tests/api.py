#!/usr/bin/python
# -*- coding: utf-8 -*-
import requests
import sys
import optparse

book = requests.request("GET", "https://www.googleapis.com/books/v1/volumes?q=Words&key=AIzaSyDYyS2cfYO-2z7dD8iEsmmzv5zYMPAbU1Y")
response = book.json()

print(response["items"][0])

