outputsHandler = {}

outputsHandler.findById = (id) => {
    return outputsHandler.items.find(i => i.id == id)
}

outputsHandler.findByDetails = (details) => {
    return outputsHandler.items.find(i => {
        if (details.type && details.type !== i.type) return false
        if (details.hasOwnProperty('source') && details.source !== i.source) return false
        return true
    })
}

outputsHandler.draw = function() {
    if (!outputsHandler.items) outputsHandler.items = []
    outputsHandler._drawCards()
    preview.handleOutputsUpdate()
}

outputsHandler.showFormToAdd = function() {
    outputsHandler._showForm({})
}

outputsHandler.showFormToEdit = function(overlay) {
    outputsHandler._showForm(overlay)
}

outputsHandler._drawCards = () => {
    $('#cards').append(outputsHandler.items.map(outputsHandler._asCard))
}

outputsHandler._asCard = (output) => {
    return components.card({
        title: output.itemname || ('Output ' + output.id + ' (' + prettyType(output.type) + ')')    ,
        options: outputsHandler._optionButtonsForOutput(output),
        body: outputsHandler._outputCardBody(output),
        state: components.stateBox(output, outputsHandler.setState),
    })
}

outputsHandler._optionButtonsForOutput = (output) => {
    const editButton = components.editButton().click(() => { outputsHandler.showFormToEdit(output); return false })
    const deleteButton = components.deleteButton().click(() => { outputsHandler.delete(output); return false })
    return [editButton, deleteButton]
}

outputsHandler._outputCardBody = (output) => {
    var details = []
    if (output.current_num_peers) {
        details.push('<strong>Number of connections:</strong> ' + output.current_num_peers)
    }

    if (output.location) {
        details.push('<strong>Location:</strong> ' + output.location)
    } else if (output.uri) {
        details.push('<strong>URI:</strong> <code>' + output.uri + '</code></div>')
    } else if (output.host && output.port && output.type === 'tcp') {
        current_domain = $('<a>').attr('href', document.location.href).prop('hostname');
        host = current_domain === '127.0.0.1' ? output.host : current_domain // Instead of domain we can use output.host but it may be an internal (private) IP
        details.push('<strong>URI:</strong> <code>tcp://' + host + ':' + output.port + '</code> (Use VLC to watch this)')
        details.push('<strong>Container:</strong> <code>' + output.container + '</code>')
    }

    if (output.hasOwnProperty('facebookStreamId')) {
        details.push('<strong>FB Live ID</strong> <a href="https://www.facebook.com/live/producer/' + output.facebookStreamId + '" target="_blank">' + output.facebookStreamId + '</a>')
    }

    if (output.hasOwnProperty('width') && output.hasOwnProperty('height')) {
        details.push('<strong>Output size:</strong> ' + prettyDimensions(output))
    }

    if (output.audio_bitrate) {
        details.push('<strong>Audio bitrate:</strong> ' + output.audio_bitrate)
    }

    if (output.hasOwnProperty('stream_name')) {
        details.push('<strong>Stream name:</strong> ' + output.stream_name)
    }

    details.push('<strong>Source:</strong> ' + output.source || 'None')

    if (output.hasOwnProperty('error_message')) details.push('<strong>ERROR:</strong> <span style="color:red">' + output.error_message + '</span>')

    return details.map(d => $('<div></div>').append(d))
}

outputsHandler.requestNewOutput = function(args) {
    submitCreateOrEdit('output', null, args)
}

function getVideoElement() {
    return document.getElementById('stream');
}

outputsHandler.delete = function(output) {
    $.ajax({
        contentType: "application/json",
        type: 'DELETE',
        url: 'api/outputs/' + output.id,
        dataType: 'json',
        success: function() {
            showMessage('Successfully deleted output ' + output.id, 'success')
            updatePage()
        },
        error: function() {
            showMessage('Sorry, an error occurred whilst deleting output ' + output.id, 'warning')
        }
    });
}

outputsHandler._handleNewFormType = function(event) {
    outputsHandler._populateForm({type: event.target.value})
}

outputsHandler._showForm = function(output) {
    outputsHandler.currentForm = $('<form></form>')
    const label = output && output.hasOwnProperty('id') ? ('Edit output ' + (output.itemname || output.id)) : 'Add output'
    showModal(label, outputsHandler.currentForm, outputsHandler._handleFormSubmit)
    outputsHandler._populateForm(output)
}

outputsHandler._populateForm = function(output) {
    const form = outputsHandler.currentForm
    form.empty()
    const isNew = !output.hasOwnProperty('id')
    if (isNew) {
        form.append(outputsHandler._getOutputsSelect(output))
    } else {
        form.append('<input type="hidden" name="id" value="' + output.id + '">')
    }
    form.append(getSourceSelect(output, isNew))

    const nameInput = formGroup({
        id: 'output-name',
        label: 'Streams Name',
        name: 'itemname',
        type: 'text',
        value: output.itemname || '',
        help: 'e.g.: <code>Ottes Twitch</code>'
    })

    switch (output.type) {
        case 'local':
            form.append('<div>(There are no extra settings for local outputs.)</div>');
            break;
        case 'tcp':
            form.append(formGroup({
                id: 'output-container',
                label: 'Container',
                name: 'container',
                options: {mpeg: 'MPEG', ogg: 'OGG'},
                value: (output.type || 'mpeg')
            }))
            form.append(formGroup({
                id: 'input-audio_bitrate',
                label: 'Audio bitrate',
                name: 'audio_bitrate',
                type: 'number',
                value: output.audio_bitrate || 320000,
                help: 'Leave blank for default (320000)',
                min: 1000,
                step: 1000,
                max: 128000*16
            }))
            form.append(getDimensionsSelect('dimensions', output.width, output.height))
            break;
        case 'rtmp':
            form.append(nameInput)
            form.append(formGroup({
                id: 'output-uri',
                label: 'Location (URI)',
                name: 'uri',
                type: 'text',
                value: output.uri || '',
                help:
                  'Twitch: <code>rtmp://live-fra02.twitch.tv/app/{key}</code> (permanent key)<br>' +
                  'YouTube: <code>rtmp://a.rtmp.youtube.com/live2/{key}</code> (new Key everytime)<br>' +
                  'Facebook: <code>rtmps://live-api-s.facebook.com:443/rtmp/{key}</code> (permanent key)<br>' +
                  'Mixcloud: <code>rtmp://rtmp.mixcloud.com/broadcast/{key}</code> (new Key everytime)',
            }));
            form.append(getDimensionsSelect('dimensions', output.width, output.height))
            break;
        case 'file':
            form.append(formGroup({
                id: 'output-location',
                label: 'Location (filename)',
                name: 'location',
                type: 'text',
                value: output.location || '',
                help: 'Example: <code>/tmp/foo-{}.mp4</code> ({} => YYYY-MM-DD_HH:MM)',
            }));
            form.append(getDimensionsSelect('dimensions', output.width, output.height))
            break;
        case 'kvs':
            form.append(formGroup({
                id: 'output-stream-name',
                label: 'Stream name',
                name: 'stream_name',
                type: 'text',
                value: output.location || '',
                help: 'You can create one on the <a href="https://us-west-2.console.aws.amazon.com/kinesisvideo/streams">AWS KVS console</a>',
            }));
            break;
        case 'facebook':
            const options = {}
            let firstFbTarget = null
            for (const target of FBWrapper.possibleTargets) {
                if (target && target.id) {
                    firstFbTarget = target.id
                    options[target.id] = `(${target.type}) ${target.name}`
                }
            }
            form.append(nameInput)
            form.append(formGroup({
                id: 'output-facebook-target',
                label: 'Facebook Ziel',
                name: 'facebooktarget',
                options,
                value: output.facebooktarget || firstFbTarget,
                required: true
            }))
            form.append(formGroup({
                id: 'output-facebook-title',
                label: 'Stream Title',
                name: 'facebooktitle',
                type: 'text',
                value: output.facebooktitle || 'Live'
            }));
            form.append(formGroup({
                id: 'output-facebook-description',
                label: 'Stream Description',
                name: 'facebookdescription',
                type: 'text',
                value: output.facebookdescription || ' - powered by Ottes - '
            }));
            form.append(getDimensionsSelect('dimensions', output.width, output.height))
            break;
    }

    form.find('select[name="type"]').change(outputsHandler._handleNewFormType);
}

outputsHandler.possibleOutputs = {
    'tcp': 'TCP (server)',
    'rtmp': 'RTMP (send to remote server)',
    'image': 'JPEG image every 1 second',
    'file': 'File (Write audio/video to a local file)',
    'webrtc': 'WebRTC for web preview',
    'kvs': 'AWS Kinesis Video',
    'local': 'Local (pop-up audio/video on this server, for debugging)',
}

outputsHandler._getOutputsSelect = function(output) {
    return formGroup({
        id: 'output-type',
        label: 'Type',
        name: 'type',
        initialOption: 'Select a type...',
        options: outputsHandler.possibleOutputs,
        value: output.type
    })
}

outputsHandler._handleNewFormType = function(event) {
    outputsHandler._populateForm({type: event.target.value})
}

outputsHandler._handleFormSubmit = function() {
    const form = outputsHandler.currentForm
    const idField = form.find('input[name="id"]')
    const id = idField.length ? idField.val() : null
    const output = (id != null) ? outputsHandler.findById(id) : {}
    let newProps = {}

    const fields = ['itemname', 'type', 'uri', 'host', 'port', 'container', 'location',
                    'audio_bitrate', 'dimensions', 'source', 'stream_name',
                    'facebooktoken', 'facebooktarget', 'facebooktitle', 'facebookdescription']
    fields.forEach(f => {
        const input = form.find('[name="' + f + '"]')
        if (input && input.val() != null) newProps[f] = input.val()
    })

    if (newProps.audio_bitrate === '') newProps.audio_bitrate = null

    splitDimensionsIntoWidthAndHeight(newProps)

    const type = newProps.type || output.type
    if (!type) {
        showMessage('Please select a type')
        return
    }

    const VALID_TYPES = ['local', 'tcp', 'image', 'file', 'webrtc', 'kvs', 'rtmp', 'facebook']
    if (VALID_TYPES.indexOf(type) === -1) {
        showMessage('Invalid type ' + type)
        return
    }

    if (type === 'facebook' && (!newProps.facebooktarget)) {
        showMessage('Facebook Target is forced!')
        return
    }

    if (type === 'facebook' && !newProps.uri) {
        showMessage('Will fetch Stream URL/ID from Facebook and continue, please wait', 'info')
        FBWrapper.getFacebookStream(newProps.facebooktarget, newProps.facebooktitle, newProps.facebookdescription, (err, streamId, uri) => {
            if (err) {
                showMessage(err);
            } else {
                form.append(formGroup({
                    id: 'output-facebook-rtmp',
                    label: 'Facebook RTMP',
                    name: 'uri',
                    type: 'text',
                    value: uri
                }));
                form.append('<input type="hidden" name="facebookStreamId" value="' + streamId + '">')
                showMessage('RTMP uri set, please submit again', 'info')
            }
        })
        return
    }

    if (type === 'rtmp' || type === 'facebook') { // or other custom api stuff with rtmp uri as target?
        good_uri_regexp = '^rtmp(s?)://'
        if (!newProps.uri || !newProps.uri.match(good_uri_regexp)) {
            showMessage('uri must start with ' + good_uri_regexp)
            return
        }
    }

    if (!Object.keys(newProps).length) {
        showMessage('No new values')
        return
    }

    if (newProps.source === 'none') newProps.source = null
    submitCreateOrEdit('output', output.id, newProps)
    hideModal()
}

outputsHandler.setState = function(id, state) {
    submitCreateOrEdit('output', id, {state})
}
