from brave.outputs.rtmp import RTMPOutput
import brave.config as config


class FacebookOutput(RTMPOutput):
    """
    For sending an output to Facebook Live RTMP, getting the url via API
    """

    def permitted_props(self):
        return {
            **super().permitted_props(),
            'facebooktarget': {
                'type': 'str',
                'required': True
            },
            'facebooktitle': {
                'type': 'str',
                'required': False,
                'default': 'LIVE'
            },
            'facebookdescription': {
                'type': 'str',
                'required': False,
                'default': 'Using Ottes\' Restreamer'
            },
            'facebookStreamId': {
                'type': 'str',
                'required': True
            },
            'width': {
                'type': 'int',
                'default': config.default_mixer_width()
            },
            'height': {
                'type': 'int',
                'default': config.default_mixer_height()
            }
        }
