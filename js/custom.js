var chart1 = null;
var chart2 = null;
$(function() {
	var colors = [
		['#1A53FF', '#4D79FF'],
		['#C61AFF', '#D24DFF'],
		['#1AC6FF', '#FF4DD2'],
		['#5781FF', '#4DD2FF'],
		['#94AFFF', '#0F4BFF'],
		['#FF1A53', '#FF4D79'],
		['#FFE494', '#D19D00'],
		['#FFD557', '#FFC30F'],
		['#FF531A', '#FF794D'],
		['#1AFF53', '#4DFF79'],
		['#C6FF1A', '#D2FF4D'],
		['#FFC61A', '#FFD24D'],
		['#005600', '#007400'],
		['#6B3100', '#914200'],
		['#74D0F1', '#A9EAFE'],
		['#004040', '#005757'],
		['#1E7FCB', '#1560BD'],
		['#117F7F', '#2B8888'],
		['#D46F1C', '#E38E48'],
		['#16A916', '#3AB53A']
	];
	var candidateAdd = function() {
		//console.log('candidateAdd');
		var tableCandidate = $('form .candidate table');
		var newRow = tableCandidate.find('tr.candidate_1').clone(false);
		var count = tableCandidate.find('tr:last').attr('class').replace('candidate_', '');
		count++;
		newRow.removeClass('candidate_1').addClass('candidate_'+count);
		newRow.find('button.remove-candidate').removeClass('hidden');
		newRow.find('td:first .count').text(count);
		newRow.find('input').val('');
		tableCandidate.append(newRow);
		candidateCount();
	};
	$('form .candidate').on('click', 'button.add-candidate', candidateAdd);
	var candidateRemove = function() {
		//console.log('candidateRemove');
		$(this).parent().parent().remove();
		candidateCount();
	};
	$('form .candidate').on('click', 'button.remove-candidate', candidateRemove);
	var candidateCount = function() {
		//console.log('candidateCount');
		var count = 0;
		$('form .candidate table').find('tr').each(function(self) {
			$(this).find('td:first .count').text(count++);
		});
	};
	var inputMarkResetFromEvent = function(event) {
		//console.log('inputMarkResetFromEvent');
		return inputMarkReset($(this));
	};
	var inputMarkReset = function(object) {
		//console.log('inputMarkReset', object);
		object.parent().removeClass('has-error');
		object.parent().removeClass('has-success');
		object.parent().removeClass('has-warning');
	};
	var inputMark = function(object, type) {
		//console.log('inputMark', object, type);
		inputMarkReset(object);
		object.parent().addClass('has-' + type);
		if(type == 'error') {
			object.focus();
		}
	};
	var formReinit = function() {
		//console.log('formReinit');
		$('form input').each(function() {
			$(this).val('');
		});
		$('form .candidate button.reinit-form').hide();
	};
	var formReinitIsDisplayed = function() {
		//console.log('formReinitIsDisplayed');
		var show = false;
		$('form input').each(function() {
			if($(this).val() != '') {
				show = true;
				return false;
			}
		});
		if(show) {
			$('form .candidate button.reinit-form').show();
		} else {
			$('form .candidate button.reinit-form').hide();
		}
		$(".alert-unsetvalue").hide();
	};
	$('form .candidate').on('click', 'button.reinit-form', formReinit);
	formReinitIsDisplayed();
	$('form').on('change', 'input', formReinitIsDisplayed);



	var calcGlobal = function(self) {
		//console.log('calcGlobal', self);
		var tableGlobal = $('form .global table');
		var global = {
			registered : {
				number : tableGlobal.find('.number.registered').val()*1
			},
			abstention : {
				number : tableGlobal.find('.number.abstention').val()*1,
				percentage : tableGlobal.find('.percentage.abstention').val()*1
			},
			voter : {
				number : tableGlobal.find('.number.voter').val()*1,
				percentage : tableGlobal.find('.percentage.voter').val()*1
			},
			blank : {
				number : tableGlobal.find('.number.blank').val()*1,
				percentage : tableGlobal.find('.percentage.blank').val()*1
			},
			voteNull : {
				number : tableGlobal.find('.number.voteNull').val()*1,
				percentage : tableGlobal.find('.percentage.voteNull').val()*1
			},
			express : {
				number : tableGlobal.find('.number.express').val()*1,
				percentage : tableGlobal.find('.percentage.express').val()*1
			}
		};

		// Les inscrits
		var registered;
		if(!global.registered.number) {
			inputMark(tableGlobal.find('.number.registered'), 'warning');
			global.registered.number = 100;
		}

		// Les abstentions
		/*if(!global.abstention.percentage) {
			inputMark(tableGlobal.find('.percentage.abstention'), 'error');
			return false;
		}*/
		if(!global.abstention.number) {
			global.abstention.number = Math.floor(global.abstention.percentage * global.registered.number / 100);
		}

		// Les votants
		if(!global.voter.number) {
			global.voter.number = Math.floor(global.registered.number - global.abstention.number);
		}
		if(!global.voter.percentage) {
			global.voter.percentage = Math.round(global.voter.number / global.registered.number * 100 * 100)/100;
		}

		// Les votes blancs
		/*if(!global.blank.percentage) {
			inputMark(tableGlobal.find('.percentage.blank'), 'error');
			return false;
		} else*/
		if(!global.blank.number) {
			global.blank.number = Math.floor(global.blank.percentage * global.voter.number / 100);
		}

		// Les votes nuls
		/*if(!global.voteNull.percentage) {
			inputMark(tableGlobal.find('.percentage.voteNull'), 'error');
			return false;
		} else*/
		if(!global.voteNull.number) {
			global.voteNull.number = Math.floor(global.voteNull.percentage * global.voter.number / 100);
		}

		// Les votes exprimés
		if(!global.express.number) {
			global.express.number = Math.floor(global.voter.number - global.blank.number - global.voteNull.number);
		}
		if(!global.express.percentage) {
			global.express.percentage = Math.round(global.express.number / global.registered.number * 100 * 100)/100;
		}
		return global;	
	};
	var calcCandidateAll = function(global) {
		//console.log('calcCandidateAll');
		var tableCandidate = $('form .candidate table');
		var hasError = false;

		if(!global || !global.registered.number || !global.express.number) {
			// Impossible de calculer
			return false;
		}
		var candidates = new Array();
		tableCandidate.find('tr[class^="candidate_"]').each(function() {
			var cvoice, cregistered, cexpress;
			cvoice = $(this).find('.voice').val();
			if(cvoice || $(this).find('.name').val()) {
				cregistered = $(this).find('.registered').val();
				cexpress = $(this).find('.express').val();
				if(cexpress) {
					cvoice = (cexpress * global.express.number / 100);
					cregistered = (cvoice / global.registered.number * 100);
				} else if(cvoice) {
					cregistered = (cvoice / global.registered.number * 100);
					cexpress = (cvoice / global.express.number * 100);
				} else if(cregistered) {
					cvoice = (cregistered * global.registered.number / 100);
					cexpress = (cvoice / global.express.number * 100);
				} else {
					inputMark($(this).find('.express'), 'error');
					hasError = true;
					return;
				}
				candidates.push({
					name : $(this).find('.name').val(),
					voice : Math.floor(cvoice),
					registered : Math.round(cregistered * 100) / 100,
					express : Math.round($(this).find('.express').val() * 100) / 100,
					comment : $(this).find('.comment').val()
				});
			}
		});
		if(hasError) {
			return false;
		}
		return candidates;
	};
	var calc = function(event) {
		//console.log('calc');
		event.preventDefault();
		//var chart1 = $('#chart-area');
		

		var global = calcGlobal($(this));
		//console.log('global', global);
		var candidates = calcCandidateAll(global);
		//console.log('candidates', candidates);
		if(!candidates || !global) {
			$(".alert-unsetvalue").show();
			return false;
		}

		// Lance le graphique
		var chart1Data = new Array();
		var chart2Data = new Array();
		var item;
		item = {
			value: global.voteNull.number,
			color:"#460303",
			highlight: "#360000",
			label: "Votes nuls (" + (Math.round(global.voteNull.number / global.registered.number * 100 * 100) / 100) + "%)"
		};
		chart1Data.push(item);
		item = $.extend({}, item);
		item.value = 0;
		item.label = "Votes nuls (" + global.voteNull.percentage + "%)";
		chart2Data.push(item);
		item = {
			value: global.blank.number,
			color:"#D3C6C6",
			highlight: "#F9D5D5",
			label: "Votes blancs (" + (Math.round(global.blank.number / global.registered.number * 100 * 100) / 100) + "%)"
		};
		chart1Data.push(item);
		item = $.extend({}, item);
		item.value = 0;
		item.label = "Votes blancs (" + global.blank.percentage + "%)";
		chart2Data.push(item);
		var sommeCandidate = 0;
		$.each(candidates, function(key, candidate) {
			sommeCandidate+= candidate.express;
			item = {
				value: candidate.voice,
				color: colors[key][0],
				highlight: colors[key][1],
				label: candidate.name + " (" + candidate.registered + "%) " + candidate.comment
			};
			chart1Data.push(item);
			item = $.extend({}, item);
			item.label = candidate.name + " (" + candidate.express + "%) " + candidate.comment;
			chart2Data.push(item);
		});
		if(sommeCandidate<98 || sommeCandidate>102) {
			$(".alert-candidate-not100").show();
			return false;
		}
		item = {
			value: global.abstention.number,
			color:"#586969",
			highlight: "#777F7F",
			label: "Abstention (" + global.abstention.percentage + "%)"
		};
		chart1Data.push(item);
		item = $.extend({}, item);
		item.value = 0;
		chart2Data.push(item);
		var chartsOptions = {
			responsive : true, 
			segmentShowStroke : false, // Séparations entre les élélents
			animateRotate : false, // Animation rotative
			animateScale : true, // Animation zoom
			showScale: true,

		};
		if(chart1) chart1.destroy();
		if(chart2) chart2.destroy();
		$('#chart1-legend').html('');
		$('div.modal.chart').modal('show');
		chart1 = new Chart(document.getElementById("chart1-area").getContext("2d")).Doughnut(chart1Data, chartsOptions);
		$('#chart1-legend').html("<h4>Légende :</h4>" + chart1.generateLegend());
		chart2 = new Chart(document.getElementById("chart2-area").getContext("2d")).Doughnut(chart2Data, chartsOptions);
		$('#chart2-legend').html("<h4>Légende :</h4>" + chart2.generateLegend());


		//chart1.toBase64Image();// => returns png data url of the image on the canvas
		//console.log(chart1Data, chart1.generateLegend(), chart1.toBase64Image());
		//chart1.generateLegend();
	};
	$('body').on('submit', 'form', calc);
	$('form').on('change', 'input', inputMarkResetFromEvent);
	$('[data-toggle="tooltip"]').tooltip();
	candidateCount();
});
