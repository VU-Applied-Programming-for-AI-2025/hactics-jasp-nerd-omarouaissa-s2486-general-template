from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

# Create your views here.

@csrf_exempt
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
    
    if request.method == "DELETE":
        return HttpResponse(f'DELETE was used')
