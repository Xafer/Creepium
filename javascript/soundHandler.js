var channel_max = 10;

var audiochannels = new Array();

for (a=0;a<channel_max;a++)
{
	audiochannels[a] = new Array();
	audiochannels[a]['channel'] = new Audio();
	audiochannels[a]['finished'] = -1;
}
function playSound(s)
{
	for (a=0;a<audiochannels.length;a++)
    {
		thistime = new Date();
		if (audiochannels[a]['finished'] < thistime.getTime())
        {
			audiochannels[a]['finished'] = thistime.getTime() + document.getElementById(s).duration*1000;
			audiochannels[a]['channel'].src = document.getElementById(s).src;
			audiochannels[a]['channel'].load();
			audiochannels[a]['channel'].play();
			break;
		}
	}
}