import torch
import torch.nn as nn

class Registry:
    def __init__(self, name):
        self._name = name
        self._module_dict = dict()

    def register(self, module):
        self._module_dict[module.__name__] = module
        return module

    def get(self, name):
        return self._module_dict.get(name)

BACKBONES = Registry("backbone")
HEADS = Registry("head")
LOSSES = Registry("loss")
METRICS = Registry("metric")
RENDERERS = Registry("renderer")
PROJECTORS = Registry("projector")
