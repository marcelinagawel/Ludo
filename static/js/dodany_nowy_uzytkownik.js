module.exports = function (req, res, grane_pokoje) {

    grane_pokoje.findOne({                           //znajdz taki dok
        _id: req.session.database._id                //id 
    },


        function (error, document) {

            req.session.database = document
            var nowy_czas = new Date().getTime()    //pobierz czas z daty


            if (req.session.database.chce_grac.length >= 2) {   //jak jest graczy 2 lub wiecej i chca grac

                req.session.czy_gracz_czeka = false             //to gracz juz nie czeka na gre

                grane_pokoje.update({ _id: req.session.database._id },  //zaktualizuj pokoje grane bo zaczynaja gre

                    { $set: { gracze_w_pokoju: 4 } },           //ustaw jako 4 graczy w pokoju zeby zablokowac pokoj
                    { multi: true },

                    function (err) { });



                if (req.session.database.czas_pokoj == 0) {     //jesli czas wynosi 0

                    grane_pokoje.update({ _id: req.session.database._id },  //zaktualizuj pokoj przekazanie buttona

                        { $set: { czas_pokoj: nowy_czas } },    //daj nowy czas i inny uzytkownik ruch
                        { multi: true },

                        function (err) { });
                }
            }


            res.json({                                          //wyslij 

                players: [...document.players],                 //zaktualizowani gracze
                gracz: req.session.gracz,

                chce_grac: req.session.database.chce_grac,      //kto chce grac

                update_czasu: (req.session.database.czas_pokoj == 0) ? nowy_czas : req.session.database.czas_pokoj //czas

            })
        })
}