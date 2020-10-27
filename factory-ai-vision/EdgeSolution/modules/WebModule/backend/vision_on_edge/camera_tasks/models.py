"""App models.
"""

import logging

from django.db import models

from ..azure_parts.models import Part
from ..cameras.models import Camera

logger = logging.getLogger(__name__)

# TODO: Once a attribute in camera_task became camera specific
# move it here


class CameraTask(models.Model):
    """CameraTask Model"""

    name = models.CharField(blank=True, max_length=200)
    camera = models.ForeignKey(Camera, on_delete=models.CASCADE)
    send_video_to_cloud = models.BooleanField(default=False)
    parts = models.ManyToManyField(Part, blank=True)
