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

    $('.pin').on('click', function() {
        var name = $('#username').text();
        var file = $(this).parent().attr('id');
        var that = this;
        var loc = window.location.href.split("/");
        var command = $(that).hasClass('pin-delete') ? 'removePin' : 'pinImage';
        fetch(command, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                'name': name,
                'file': file
            })
        }).then(function(res) {
            if (res.ok) {
                if (loc[loc.length - 1] === "userpinned")
                    window.location.reload()

                $(that).hasClass('pin-delete') ? $(that).removeClass('pin-delete clicked').addClass('pin-add') : $(that).removeClass('pin-add').addClass('pin-delete clicked');
            } else {
                console.log("error");
            }
        })
    })

})
