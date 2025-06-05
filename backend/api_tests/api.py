#!/usr/bin/python
# -*- coding: utf-8 -*-
import requests
import sys
import optparse

book = requests.request("GET", "https://www.googleapis.com/books/v1/volumes?q=flowers+inauthor:keyes&key=AIzaSyAI8gKE3AQCSaGhCigcNXRq57OOWmHaT-g")
with open("output.json", "w", encoding="utf-8") as f:
    f.write(book.text)

book = requests.request("GET", "https://www.googleapis.com/books/v1/volumes?q=Words&key=AIzaSyDYyS2cfYO-2z7dD8iEsmmzv5zYMPAbU1Y")
response = book.json()

print(response["items"][0])

