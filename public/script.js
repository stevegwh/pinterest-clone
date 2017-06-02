jQuery(document).ready(function($) {
    var options = {
        align: 'center',
        autoResize: true,
        comparator: null,
        container: $('#wrapper'),
        direction: undefined,
        ignoreInactiveItems: true,
        itemWidth: 0,
        fillEmptySpace: false,
        flexibleWidth: 0,
        offset: 2,
        onLayoutChanged: undefined,
        outerOffset: 0,
        possibleFilters: [],
        resizeDelay: 50,
        verticalOffset: undefined
    }
    $('#gallery-wrapper').wookmark(options);

    if ($('#flash').text()) {
        $('#flash').removeClass('disabled');
    } else {
        $('#flash').addClass('disabled');
    }

    $('.upload').on('click', function() {
        $('.upload').addClass('form-disabled').prop('required', false);
        $(this).removeClass('form-disabled').prop('required', true);
    })

    $('.img-pin').on('click', function() {
        var img = $(this).parent().attr('id');
        var name = $('#username').text();
        var that = this;

        fetch('pinImage', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                'name': name,
                'img': img
            })
        }).then(function(res) {
            if (res.ok) {
                $(that).prop('disabled', 'disabled');
            } else {
                console.log("error");
            }
        })
    })

    $('.upload-delete').on('click', function() {
        var file = $(this).parent().attr('id');
        fetch('deleteUpload', {
            method: 'delete',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                'file': file
            })
        }).then(function(res) {
            if (res.ok) return res.json()
        }).then(function(data) {

            window.location.reload();
        })
    });

    $('.pin-delete').on('click', function() {
        var name = $('#username').text();
        var file = $(this).parent().attr('id');
        fetch('removePin', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                'name': name,
                'file': file
            })
        }).then(function(res) {
            if (res.ok) {

                window.location.reload();
            }
        })
    })
})
