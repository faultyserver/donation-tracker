# -*- coding: utf-8 -*-
# Generated by Django 1.11.9 on 2018-01-20 04:45


import datetime
from django.db import migrations


def backfill_event_datetime(apps, schema_editor):
    Event = apps.get_model('tracker', 'Event')  # noqa N806
    db_alias = schema_editor.connection.alias
    for event in Event.objects.using(db_alias).order_by('date'):
        run = event.speedrun_set.order_by('starttime').first()
        print(event.name)
        if run and run.starttime:
            event.datetime = run.starttime
            print('run start %s' % event.datetime.astimezone(event.timezone))
        else:
            event.datetime = event.timezone.localize(
                datetime.datetime.combine(event.date, datetime.time(12, 0))
            )
            print('noon default')
        event.save()


def noop(a, b):
    pass


class Migration(migrations.Migration):
    dependencies = [
        ('tracker', '0002_add_event_datetime'),
    ]

    operations = [migrations.RunPython(backfill_event_datetime, noop, elidable=True)]
