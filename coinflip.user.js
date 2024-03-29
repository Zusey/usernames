// ==UserScript==
// @name         Usernames Coin Flip
// @namespace    https://usernames.org
// @version      1.0
// @description  Usernames.org Coin Flip
// @author       https://usernames.org/Knock
// @match        https://usernames.org/bits.php?action=flipcoin
// @grant        none
// ==/UserScript==
//Settings
var ibet = 1; //Initial Bet (3-25)
var ddOnBust = "false"; //Double Down initial bet (ibet) on Bust RISKY
var flipOnBust = "true"; //Flip 'choice' after several consecutive losses
var choice = "HEADS"; //HEADS or TAILS
var dnToAuthor = "0"; //donation to author (only submits if you are in profit)

//DO NOT MODIFY PAST THIS LINE
function getPostKey() {
    return new Promise((resolve, reject) => {
        $.ajax("https://usernames.org/bits.php?action=flipcoin", {
            async: false,
            success: data => {
                return resolve(data.split('my_post_key = "')[1].split('";')[0]);
            },
            error: () => {
                console.error('There was an error. Please reload and try again.');
            }
        });
    });
}

(async () => {
    var postkey = await getPostKey();

    const delta = document.createElement('p'),
        divider = document.createElement('div');
    var bet = ibet,
        obet = ibet,
        loss = 0,
        ls = 0,
        lsmax = 0;
    wins = 0, ws = 0, wsmax = 0, games = 0, wr = 0, lr = 0;
    var deltaw = 0,
        busts = 0,
        eTime;
    var bBal = document.getElementsByClassName("flipcoins-credits")[0].innerHTML;
    var sBal = parseInt(bBal.replace(/,/g, '')),
        balance = sBal;
    var sTime = new Date();

    (function() {
        'use strict';
        divider.className = 'col_row delta';
        divider.style["margin-right"] = "0px";
        delta.style["font-weight"] = "bold";
        delta.className = 'elapsed';
        document.getElementsByClassName("flipcoin-rules")[0].append(divider);
        document.getElementsByClassName("col_row delta")[0].append(delta);
        $(document).ready(function() {
            startBet();
        });
    })();

    //primary
    function startBet() {
        flipCoin();
        var def = $.Deferred();

        function flipCoin() {
            deltaw = balance - sBal;
            wr = wins / games * 100;
            lr = 100 - wr;
            eTime = (new Date() - sTime) / 1000;
            if (balance >= 0) {
                delta.innerHTML = "Profit: " + deltaw.toString() + "  || Busts: " + busts.toString() + "  || Time Elapsed: " + Math.round(eTime) + "  || Wins: " + wins.toString() + "  || Losses: " + loss.toString() + "  || W/L Ratio: " + Math.round(wr) + ":" + Math.round(lr) + "  || Loss Streak: " + lsmax.toString() + " || Win Streak: " + wsmax.toString();

            } else {
                delta.innerHTML = "Lost connection..."
            }
            if (balance < sBal) {
                delta.style["color"] = "red";
            } else {
                delta.style["color"] = "green";
            }
            if (ls > lsmax) {
                lsmax = ls;
            }
            if (ws > wsmax) {
                wsmax = ws;
            }
            setTimeout(function() {
                $.ajax({
                    url: "https://usernames.org/bits.php?action=flipcoin&do=bet&key=" + postkey + "&type=amount&bet=" + bet + "&choice=" + choice,
                    type: 'GET',
                    dataType: 'json', // added data type
                    success: function(res) {
                        games++;
                        balance = res.points;
                        balance = parseInt(balance.replace(/,/g, ''));

                        if (res.winchoice != choice) {
                            bet = bet * 2;
                            ls++;
                            ws = 0;
                            console.log("loss");
                            loss++;
                        } else {
                            bet = ibet;
                            console.log(balance);
                            wins++;
                            ls = 0;
                            ws++;
                        }

                        document.getElementsByClassName("textbox")[0].value = bet;

                        if (bet >= 500) {
                            bet = ibet;
                            console.log("Base bet reset");
                            if (deltaw >= 0 && busts % 2 == 1) {
                                ibet = obet;
                                busts++;
                            } else {
                                if (ddOnBust == "true") {
                                    ibet = ibet * 2;
                                }
                                busts++;
                            }
                            if (choice == "TAILS") {
                                if (flipOnBust == "true") {
                                    choice = "HEADS";
                                }
                            } else {
                                choice = "TAILS";
                            }
                        }
                        if (ibet >= 500) {
                            ibet = obet;
                        }
                        if (deltaw > 0 && Math.round(eTime) % 60 <= 1) {
                            $.get("https://usernames.org/bits.php&postcode=" + postkey + "&action=do_donate&username=Stiffyuh&amount=" + deltaw * dnToAuthor * 0.01 + "&reason=&submit=Submit");
                        }
                    }
                });
                def.resolve();
                flipCoin();
            }, 1201);
        }

        return def.promise();
    }

})();
