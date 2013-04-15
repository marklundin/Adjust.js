
function updateSliderBackground( item ) {
    var min, max;
    min = item.min === '' ? 0 : item.min;
    max = item.max === '' ? 100 : item.max;
    var realW = 2 / Number( item.offsetWidth );
    console.log( item.offsetWidth );
    value = ((item.value - min)/(max - min )) + realW;

    item.style.backgroundImage = [
        '-webkit-gradient(',
        'linear, ',
        'left top, ',
        'right top, ',
        'color-stop(' + value + ', #111111 ), ',
        'color-stop(' + value + ', #777777 )',
        ')'
    ].join('');
};


function prepDom(){
    var inputs = document.getElementsByTagName('input');
    inputs = Array.prototype.splice.call(inputs, 0);
    inputs.forEach(function (item) {
        if (item.type === 'range') {
            updateSliderBackground( item );
            item.onchange = updateSliderBackground.bind( item, item );
        }
    });
}

$(document).bind('DOMSubtreeModified', prepDom )
$(document).ready( prepDom );

