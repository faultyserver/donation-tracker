# -*- coding: utf-8 -*-


from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tracker', '0003_add_event_timezone'),
    ]

    operations = [
        migrations.AlterField(
            model_name='runner',
            name='stream',
            field=models.URLField(max_length=128, blank=True),
        ),
        migrations.AlterField(
            model_name='runner',
            name='twitter',
            field=models.SlugField(max_length=15, blank=True),
        ),
        migrations.AlterField(
            model_name='runner',
            name='youtube',
            field=models.SlugField(max_length=20, blank=True),
        ),
        migrations.AlterField(
            model_name='speedrun',
            name='endtime',
            field=models.DateTimeField(verbose_name='End Time', null=True, editable=False),
        ),
        migrations.AlterField(
            model_name='speedrun',
            name='starttime',
            field=models.DateTimeField(verbose_name='Start Time', null=True, editable=False),
        ),
    ]
