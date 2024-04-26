from django.shortcuts import render
from django.http import HttpResponse

from django.http import JsonResponse
from .models import locations,AnchorPoint,Building,CoordinationGraph

from math import radians, sin, cos, sqrt, atan2

from frondend.util import CampusResponse
from django.views.decorators.csrf import csrf_exempt

# Create your views here.
def index(request):
    return render(request,"index.html")
def geo(request):
    return render(request,"ar.html")

def your_model_list(request):
    _response = CampusResponse()

    try:
        your_model_data = list(locations.objects.all().values())
        _response.data = your_model_data
        _response.status = 200
        _response.description = 'Data fetched successfully.'
    except Exception as err:
        _response.status = 500
        _response.error = str(err)
        _response.data = []
        _response.description = ''

    return JsonResponse(vars(_response))



def haversine_distance(lat1, lon1, lon2,lat2):
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * atan2( sqrt(a), sqrt(1 - a) )
    R = 6371.0
    distance = R * c
    print(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",lat1, lon1, lat2, lon2,">>>>>>>>>>>>",distance)
    return distance


def find_route(request):
    # Get current location and destination coordinate from request
    current_lat = float(request.GET.get('current_lat'))
    current_lon = float(request.GET.get('current_lon'))
    current_loc = str(current_lon) + ','+ str(current_lat)
    destination_coord = request.GET.get('destination_coord')
    route_direction = []
    
    anchor_points = AnchorPoint.objects.all()
    nearest_anchor_point = min(anchor_points, key=lambda anchor: haversine_distance(float(current_lat), float(current_lon), *map(float, anchor.anchor_coords.split(','))))

    print(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",destination_coord,type(destination_coord))
    _dest_coordinate_obj = Building.objects.get(prop_coord = destination_coord )
    
    _coordination_system = CoordinationGraph.objects.all()
    
    l1,l2 = map(float, destination_coord.split(','))
    route_direction.append([l1,l2])
    
    _coordGrph_filter = {
        'is_dest' : True,
        'next_node' : destination_coord
    }
    print("Standing coordinate",current_loc)
    print("GOT the nearest coordinate",nearest_anchor_point.anchor_coords)
    while True:
        try:
            _current_position =  CoordinationGraph.objects.get( **_coordGrph_filter )
            print("GOT the record",_current_position.next_node)
            _c_node = _current_position.next_node
            _cM1_node = _current_position.current_node
            _cM2_node = _current_position.prev_node
            if _cM1_node == nearest_anchor_point.anchor_coords:
                print(">>>>>>>>>>")
                l1,l2 = map(float, _cM1_node.split(','))
                route_direction.append([l1,l2])
                break
            elif _cM2_node == nearest_anchor_point.anchor_coords:
                print("<<<<<<<<<<") 
                l1,l2 = map(float, _cM1_node.split(','))
                route_direction.append([l1,l2])
                l1,l2 = map(float, _cM2_node.split(','))
                route_direction.append([l1,l2])
                break
            else:
                l1,l2 = map(float, _cM1_node.split(','))
                route_direction.append([l1,l2])
                _coordGrph_filter = {
                    'is_dest' : False,
                    'next_node' : _cM1_node,
                    'current_node' : _cM2_node
                }
        except Exception as err:
            break
    l1,l2 = map(float, nearest_anchor_point.anchor_coords.split(','))
    route_direction.append([l1,l2])
    l1,l2 = map(float, current_loc.split(','))
    route_direction.append([l1,l2])
    print("response despatched")
    return JsonResponse({
        'status':True,
        'route':route_direction
    })

