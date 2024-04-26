from django.db import models

# Create your models here.
class locations(models.Model):
    building_name = models.CharField(max_length=100)
    description = models.CharField(max_length=256)
    latitude = models.CharField(max_length=256)
    longitude = models.CharField(max_length=256)
    location_image = models.CharField(max_length=256,null=True,blank=True)
    location_type= models.CharField(max_length=256,null=True,blank=True)

    def __str__(self):
        return self.name

class department(models.Model):
    department_name = models.CharField(max_length=100)
    floor =  models.CharField(max_length=256,null=True,blank=True)
    building_id = models.ForeignKey(locations,on_delete=models.CASCADE)
    room_number =  models.IntegerField(null=True,blank=True)
    department_contact_info = models.CharField(max_length=256,null=True,blank=True)

    def __str__(self):
        return self.department_name


class AnchorPoint(models.Model):
   anchor_coords = models.CharField(max_length=100)


class Building(models.Model):
    prop_name = models.CharField(max_length=100)
    prop_type = models.CharField(max_length=100)
    prop_coord = models.CharField(max_length=100)


class CoordinationGraph(models.Model):
    prev_node = models.CharField(max_length=100)
    current_node = models.CharField(max_length=100)
    next_node = models.CharField(max_length=100)
    is_dest = models.BooleanField(default=False)

