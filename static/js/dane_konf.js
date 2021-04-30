export class dane_konf {


    //cały protokuł fetcha to --------------------- AJAX --------------------
    async wysylanie() {

        var dynamiczne_polaczenie = await new Promise((success, error) => {  //obietnica dynamicznego polaczenia

            fetch(this.wysylka, {

                method: 'POST',                             //metoda postem
                headers: {
                    'Content-Type': this.contentType        //zgodnie z formatem
                },
                body: JSON.stringify(this.data),        //stringify dancyh

            })


                .then(response => response.json())  //fetch jest asychroniczny
                .then(async data => {                   //akcje ktore wykonaja sie w momencie w ktoym server
                    this.response = data                //wysle juz (odelse) dane

                    success(data)
                })


                .catch((error) => { }                   //zlap errory


                )
        })
        return dynamiczne_polaczenie
    }



    async dynamiczne_polaczenie() {

        var dynamiczne_polaczenie = await new Promise((success, error) => { //obietnica dynamicznego polaczenia

            this.data = null                                //puste dane

            fetch(this.wysylka, {
                method: 'GET',                          //metoda getem
            })


                .then(response => response.json())
                .then(data => {

                    success(data)
                })


                .catch((error) => { }



                )
        })
        return dynamiczne_polaczenie
    }



    constructor(contentType, data, wysylka) {               //wstepne info do skonfigurowania

        var contentTypes = {
            json: "application/json",
        }

        this.response = null
        this.data = data || null

        this.wysylka = wysylka

        this.contentType = contentType || contentTypes.json

    }



    zmiany_wazne(method, data, wysylka) {

        this.data = data || this.data
        this.method = method || this.method
        this.wysylka = wysylka || this.wysylka

    }



}