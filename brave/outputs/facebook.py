from brave.outputs.rtmp import RTMPOutput
import brave.config as config


class FacebookOutput(RTMPOutput):
    """
    For sending an output to Facebook Live RTMP, getting the url via API
    need the accesstoken from the frontend or make the call from the frontend
    and send url/token?
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
            'width': {
                'type': 'int',
                'default': config.default_mixer_width()
            },
            'height': {
                'type': 'int',
                'default': config.default_mixer_height()
            }
        }
