# Generated by Django 4.2 on 2024-03-12 06:06

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='locations',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('building_name', models.CharField(max_length=100)),
                ('description', models.CharField(max_length=100)),
                ('latitude', models.DecimalField(decimal_places=9, max_digits=20)),
                ('longitude', models.DecimalField(decimal_places=9, max_digits=20)),
                ('location_image', models.CharField(blank=True, max_length=256, null=True)),
                ('location_type', models.CharField(blank=True, max_length=256, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='department',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('department_name', models.CharField(max_length=100)),
                ('floor', models.CharField(blank=True, max_length=256, null=True)),
                ('room_number', models.IntegerField(blank=True, max_length=256, null=True)),
                ('department_contact_info', models.CharField(blank=True, max_length=256, null=True)),
                ('building_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='frondend.locations')),
            ],
        ),
    ]
