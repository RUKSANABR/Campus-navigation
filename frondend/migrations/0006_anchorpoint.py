# Generated by Django 4.2 on 2024-03-21 04:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('frondend', '0005_delete_anchorpoint'),
    ]

    operations = [
        migrations.CreateModel(
            name='AnchorPoint',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('latitude', models.DecimalField(decimal_places=9, max_digits=20)),
                ('longitude', models.DecimalField(decimal_places=9, max_digits=20)),
            ],
        ),
    ]
