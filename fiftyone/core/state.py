"""
Defines the shared state between the FiftyOne App and SDK.

| Copyright 2017-2020, Voxel51, Inc.
| `voxel51.com <https://voxel51.com/>`_
|
"""
from collections import OrderedDict
import logging

from bson import json_util

import eta.core.serial as etas

import fiftyone.core.dataset as fod
import fiftyone.core.fields as fof
import fiftyone.core.labels as fol
import fiftyone.core.odm as foo
import fiftyone.core.media as fom
import fiftyone.core.stages as fos
import fiftyone.core.utils as fou
import fiftyone.core.view as fov


logger = logging.getLogger(__name__)


class StateDescription(etas.Serializable):
    """Class that describes the shared state between the FiftyOne App and
    a corresponding :class:`fiftyone.core.session.Session`.

    Attributes:
        dataset: the current :class:`fiftyone.core.session.Session`
        selected: the list of currently selected samples
        view: the current :class:`fiftyone.core.view.DatasetView`

    Args:
        close (False): whether to close the app
        connected (False): whether the session is connected to an app
        dataset (None): the current :class:`fiftyone.core.dataset.Dataset`
        selected (None): the list of currently selected samples
        view (None): the current :class:`fiftyone.core.view.DatasetView`
    """

    def __init__(
        self,
        close=False,
        connected=False,
        dataset=None,
        selected=None,
        view=None,
        filters={},
    ):
        self.close = close
        self.connect = connected
        self.dataset = dataset
        self.view = view
        self.selected = selected or []
        self.filters = filters
        super().__init__()

    def serialize(self, reflective=False):
        """Serializes the state into a dictionary.

        Args:
            reflective: whether to include reflective attributes when
                serializing the object. By default, this is False
        Returns:
            a JSON dictionary representation of the object
        """
        with fou.disable_progress_bars():
            d = super().serialize(reflective=reflective)
            d["dataset"] = (
                self.dataset._serialize() if self.dataset is not None else None
            )
            d["view"] = (
                self.view._serialize() if self.view is not None else None
            )
            return d

    def attributes(self):
        """Returns list of attributes to be serialize"""
        return list(
            filter(
                lambda a: a not in {"dataset", "view"}, super().attributes()
            )
        )

    @classmethod
    def from_dict(cls, d, **kwargs):
        """Constructs a :class:`StateDescription` from a JSON dictionary.

        Args:
            d: a JSON dictionary

        Returns:
            :class:`StateDescription`
        """
        close = d.get("close", False)
        connected = d.get("connected", False)
        selected = d.get("selected", [])

        dataset = d.get("dataset", None)
        if dataset is not None:
            dataset = fod.load_dataset(dataset.get("name"))
        stages = d.get("view", [])
        if dataset is not None and stages:
            view = fov.DatasetView(dataset)
            view._stages = [fos.ViewStage._from_dict(s) for s in stages]
        else:
            view = None

        return cls(
            close=close,
            connected=connected,
            dataset=dataset,
            selected=selected,
            view=view,
            **kwargs
        )


class DatasetStatistics(etas.Serializable):
    """@todo"""

    def __init__(self, view):
        pass
