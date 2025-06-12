from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.

def get_favorites(request):
    if request.method == "GET":
        print('get request was received')
        return HttpResponse("hello")
    
    if request.method == "POST":
        info = request.body
        return HttpResponse(f'{info} was received')
    
    if request.method == "PUT":
        info = request.body
        return HttpResponse(f'{info} was received PUT')
