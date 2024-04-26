from django.contrib import admin
from django.urls import path
import frondend.views as Mview

from .views import your_model_list,find_route

urlpatterns = [
    path('',Mview.index,name='index'),
    path('geo/',Mview.geo,name='geo'),
     path('api/yourmodel/', your_model_list, name='yourmodel-list'),
     path('find_route/',find_route, name='find_route'),
] 