angular.module('gpca')
    .controller('MainCtrl', function ($scope, $http, constants, $interval, $localStorage, SweetAlert) {

        // valida session ----------------------------------------------------------------

        var ValidaSessionUsuario = function () {
            var body = {
                'RefreshToken': $localStorage.user.refreshToken
            };

            $http.post(constants.UrlAuthApi + 'Auth/ValidateSession', body)
                .then(function (response) {
                    if (response.data.success) {
                        $localStorage.userAuthenticated = true;
                    } else {

                        $localStorage.$reset();
                        $localStorage.userAuthenticated = false;

                        SweetAlert.swal({
                            title: "Ops!",
                            type: "error",
                            text: "Sua sessão expirou. Faça o login novamente."
                        },
                            function (isConfirm) {
                                if (isConfirm) {
                                    $interval.cancel(stopId);
                                    window.location = "#/Login";
                                }
                            });
                    }
                }, function (error) {
                    $localStorage.$reset();
                    angular.forEach(error.data, function (value, index) {
                        value;
                    });
                });
        }


        if ($localStorage.user != undefined) {
            ValidaSessionUsuario();
        } else {
            window.location = "#/Login";
        }

        var stopId = 0;
        stopId = $interval(function () {
            if ($localStorage.user != undefined) {

                ValidaSessionUsuario();
            } else {
                $interval.cancel(stopId);
            }
        }, 300000); // 5min


        // -------------------------------------------------------------------------------

    })
    .controller('DashboardCtrl', function ($scope, DashboardService, RelatoriosService, $loading, $q, SweetAlert) {

        $loading.start('load');

        // Filtros -------------------------------------------------------------------------------

        $scope.lstPeriodoAnual = [];
        $scope.selectedPeriodoAno = "";
        $scope.selectedPeriodo = "";
        $scope.itemSelectType = "";
        $scope.tab = 1;

        RelatoriosService.GetProcessedReports().then(function (response) {
            var data = response.data;
            $scope.lstPeriodo = data;

            var txt = "";
            angular.forEach(data, function (value, key) {
                if (txt != value.mesCompetencia.substr(3, 4)) {
                    txt = value.mesCompetencia.substr(3, 4);
                    $scope.lstPeriodoAnual.push({ ano: txt });
                }
            });

            $scope.selectedPeriodoAno = $scope.lstPeriodoAnual[$scope.lstPeriodoAnual.length - 1].ano;
            $scope.montaDashsLine();
            $scope.montaTotalAnual();
        });

        // ---------------------------------------------------------------------------------------

        // CHART-BAR.JS - exemplo ----------------------------------------------------------------

        const options = { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 3 }
        const formatter = new Intl.NumberFormat('pt-BR', options)

        $scope.options = {
            legend: {
                display: true
            },
            scales: {
                yAxes: [{
                    ticks: {
                        // Include a dollar sign in the ticks
                        callback: function (value, index, values) {
                            return formatter.format(value.toString());
                        }
                    }
                }]
            },
            tooltips: {
                callbacks: {
                    label: function (tooltipItem, data) {
                        return tooltipItem.xLabel + ": " + formatter.format(tooltipItem.yLabel);
                    },
                },
            }
        };
        $scope.colors = ['#45b7cd', '#ff6384', '#ff8e72', '#8690dd', '#7560e9'];
        $scope.labels = ['JV184', 'JV214', 'JV93', 'JV94', 'JV200', 'JV201', 'JV202'];
        $scope.chSeries = ['01-Imobilizado', '02-Bens', '03-Servicos', '06-Locacao', '08-Locacao'];

        $scope.data = [
            [65, 59, 80, 81, 56, 55, 40],
            [28, 48, 40, 19, 86, 27, 90],
            [12, 59, 80, 81, 56, 55, 40],
            [44, 48, 40, 19, 86, 27, 75],
            [55, 48, 29, 11, 48, 87, '81.45']
        ];



        // END CHART-BAR.JS ---------------------------------------------------------------------

        // CHART-LINE.JS ------------------------------------------------------------------------

        $scope.montaDashsLine = function () {
            $loading.start('load');

            $scope.options2 = {
                legend: {
                    display: true
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            // Include a dollar sign in the ticks
                            callback: function (value, index, values) {
                                return formatter.format(value.toString());
                            }
                        }
                    }]
                },
                tooltips: {
                    callbacks: {
                        label: function (tooltipItem, data) {
                            return formatter.format(tooltipItem.yLabel);
                        },
                    },
                }
            };
            $scope.colors2 = ['#bfbcbb', '#ff6384', '#ff8e72'];
            $scope.chSeries2 = ['Todos', 'Creditáveis', 'Não Creditáveis'];
            $scope.labels2 = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
            $scope.data2 = [];

            DashboardService.GetDahsLine($scope.selectedPeriodoAno).then(function (response) {
                var data = response.data;

                if (data != null) {
                    angular.forEach(data.ambos, function (value, key) {
                        if ($scope.data2[0] != undefined) {
                            $scope.data2[0].push(value.volumeTotal);
                        } else {
                            $scope.data2.push([value.volumeTotal]);
                        }
                    });

                    angular.forEach(data.creditaveis, function (value, key) {
                        if ($scope.data2[1] != undefined) {
                            $scope.data2[1].push(value.volumeTotal);
                        } else {
                            $scope.data2.push([value.volumeTotal]);
                        }
                    });

                    angular.forEach(data.naoCreditaveis, function (value, key) {
                        if ($scope.data2[2] != undefined) {
                            $scope.data2[2].push(value.volumeTotal);
                        } else {
                            $scope.data2.push([value.volumeTotal]);
                        }
                    });
                }

                $loading.finish('load');
            });

            // data3
            $scope.options3 = {
                legend: {
                    display: true
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            // Include a dollar sign in the ticks
                            callback: function (value, index, values) {
                                return formatter.format(value.toString());
                            }
                        }
                    }]
                },
                tooltips: {
                    callbacks: {
                        label: function (tooltipItem, data) {
                            return formatter.format(tooltipItem.yLabel);
                        },
                    },
                }
            };
            $scope.colors3 = ['#bfbcbb', '#ff6384', '#ff8e72', '#97bbcd', '#fdb45c', '#949fb1', '#fa8e90'];
            $scope.chSeries3 = ['Vazio', '01 - imobilizado', '02 - Bens', '02 - Bens - importação', '03 - Serviços', '06 - Locação', '08 - Locação'];
            $scope.labels3 = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
            $scope.data3 = [];

            DashboardService.GetDahsLineItemtype($scope.selectedPeriodoAno).then(function (response) {
                var data = response.data;

                if (data != null) {
                    angular.forEach(data.ambos, function (value, key) {

                        if (value.tipoItem == '' || value.tipoItem == null) {
                            if ($scope.data3[0] != undefined) {
                                $scope.data3[0].push(value.volumeTotal);
                            } else {
                                $scope.data3.push([value.volumeTotal]);
                            }
                        } else if (value.tipoItem == '01 - imobilizado') {
                            if ($scope.data3[1] != undefined) {
                                $scope.data3[1].push(value.volumeTotal);
                            } else {
                                $scope.data3.push([value.volumeTotal]);
                            }
                        } else if (value.tipoItem == '02 - Bens') {
                            if ($scope.data3[2] != undefined) {
                                $scope.data3[2].push(value.volumeTotal);
                            } else {
                                $scope.data3.push([value.volumeTotal]);
                            }
                        } else if (value.tipoItem == '02 - Bens - importação') {
                            if ($scope.data3[3] != undefined) {
                                $scope.data3[3].push(value.volumeTotal);
                            } else {
                                $scope.data3.push([value.volumeTotal]);
                            }
                        } else if (value.tipoItem == '03 - Serviços') {
                            if ($scope.data3[4] != undefined) {
                                $scope.data3[4].push(value.volumeTotal);
                            } else {
                                $scope.data3.push([value.volumeTotal]);
                            }
                        } else if (value.tipoItem == '06 - Locação') {
                            if ($scope.data3[5] != undefined) {
                                $scope.data3[5].push(value.volumeTotal);
                            } else {
                                $scope.data3.push([value.volumeTotal]);
                            }
                        } else if (value.tipoItem == '08 - Locação') {
                            if ($scope.data3[6] != undefined) {
                                $scope.data3[6].push(value.volumeTotal);
                            } else {
                                $scope.data3.push([value.volumeTotal]);
                            }
                        }

                        $loading.finish('load');
                    });
                }

                $loading.finish('load');
            });
        }

        // END CHART ----------------------------------------------------------------------------


        // CHART-DOUGHNUT.JS --------------------------------------------------------------------

        $scope.montaDoughnuts = function () {

            $scope.options4 = {
                responsive: true,
                legend: {
                    display: true,
                    position: 'top',
                    maxWidth: 10,
                    labels: {
                        boxWidth: 10,
                        padding: 10
                    }
                },
                tooltips: {
                    callbacks: {
                        label: function (tooltipItem, data) {
                            return data.labels[tooltipItem.index] + ' : ' + formatter.format(data.datasets[0].data[tooltipItem.index]);
                        },
                    },
                },
                title: {
                    display: true,
                    text: 'Valores das compras por CFOP'
                }
            };

            $scope.options5 = {
                responsive: true,
                legend: {
                    display: true,
                    position: 'top',
                    maxWidth: 10,
                    labels: {
                        boxWidth: 10,
                        padding: 10
                    }
                },
                tooltips: {
                    callbacks: {
                        label: function (tooltipItem, data) {
                            return data.labels[tooltipItem.index] + ' : ' + formatter.format(data.datasets[0].data[tooltipItem.index]);
                        },
                    },
                },
                title: {
                    display: true,
                    text: 'Valores das compras por Natureza do Crédito'
                }
            };

            $scope.options6 = {
                responsive: true,
                legend: {
                    display: true,
                    position: 'top',
                    maxWidth: 10,
                    labels: {
                        boxWidth: 10,
                        padding: 10
                    }
                },
                tooltips: {
                    callbacks: {
                        label: function (tooltipItem, data) {
                            return data.labels[tooltipItem.index] + ' : ' + formatter.format(data.datasets[0].data[tooltipItem.index]);
                        },
                    },
                },
                title: {
                    display: true,
                    text: 'Valores das compras por Consórcios'
                }
            };

            $scope.options7 = {
                responsive: true,
                legend: {
                    display: true,
                    position: 'top',
                    maxWidth: 10,
                    labels: {
                        boxWidth: 10,
                        padding: 10
                    }
                },
                tooltips: {
                    callbacks: {
                        label: function (tooltipItem, data) {
                            return data.labels[tooltipItem.index] + ' : ' + formatter.format(data.datasets[0].data[tooltipItem.index]);
                        },
                    },
                },
                title: {
                    display: true,
                    text: 'Valores das compras por JVs'
                }
            };

            $scope.options8 = {
                responsive: true,
                legend: {
                    display: true,
                    position: 'top',
                    maxWidth: 10,
                    labels: {
                        boxWidth: 10,
                        padding: 10,
                        color: 'darkred',
                        font: {
                            size: 6
                        }
                    }
                },
                tooltips: {
                    callbacks: {
                        label: function (tooltipItem, data) {
                            return data.labels[tooltipItem.index] + ' : ' + formatter.format(data.datasets[0].data[tooltipItem.index]);
                        },
                    },
                },
                title: {
                    display: true,
                    text: 'Valores das compras por Fornecedores'
                }
            };

            $scope.options9 = {
                responsive: true,
                legend: {
                    display: true,
                    position: 'top',
                    maxWidth: 10,
                    labels: {
                        boxWidth: 10,
                        padding: 10
                    }
                },
                tooltips: {
                    callbacks: {
                        label: function (tooltipItem, data) {
                            return data.labels[tooltipItem.index] + ' : ' + formatter.format(data.datasets[0].data[tooltipItem.index]);
                        },
                    },
                },
                title: {
                    display: true,
                    text: 'Valores das compras por Meta Objetos'
                }
            };

            $scope.labels4 = [];
            $scope.data4 = [];

            $scope.labels5 = [];
            $scope.data5 = [];

            $scope.labels6 = [];
            $scope.data6 = [];

            $scope.labels7 = [];
            $scope.data7 = [];

            $scope.labels8 = [];
            $scope.data8 = [];

            $scope.labels9 = [];
            $scope.data9 = [];

            var periodo = '01/' + $scope.selectedPeriodo;
            var GetDashs = DashboardService.GetDashDoughnuts(periodo);


            $q.all([GetDashs]).then(function (response) {
                var data = response[0].data;

                if (data != null) {
                    angular.forEach(data.cfoPs, function (Value, Key) {
                        $scope.labels4.push((Value.descricao == "" || Value.descricao == null) ? 'Vazio' : Value.descricao);
                        $scope.data4.push(Value.volumeTotal);
                    });

                    angular.forEach(data.tipoItems, function (Value, Key) {
                        $scope.labels5.push((Value.descricao == "" || Value.descricao == null) ? 'Vazio' : Value.descricao);
                        $scope.data5.push(Value.volumeTotal);
                    });

                    angular.forEach(data.consorcios, function (Value, Key) {
                        $scope.labels6.push((Value.descricao == "" || Value.descricao == null) ? 'Vazio' : Value.descricao);
                        $scope.data6.push(Value.volumeTotal);
                    });

                    angular.forEach(data.jVs, function (Value, Key) {
                        $scope.labels7.push((Value.descricao == "" || Value.descricao == null) ? 'Vazio' : Value.descricao);
                        $scope.data7.push(Value.volumeTotal);
                    });

                    angular.forEach(data.fornecedores, function (Value, Key) {
                        $scope.labels8.push((Value.descricao == "" || Value.descricao == null) ? 'Vazio' : Value.descricao);
                        $scope.data8.push(Value.volumeTotal);
                    });

                    angular.forEach(data.metaObjetos, function (Value, Key) {
                        $scope.labels9.push((Value.descricao == "" || Value.descricao == null) ? 'Vazio' : Value.descricao);
                        $scope.data9.push(Value.volumeTotal);

                        $loading.finish('load');
                    });
                } else {
                    $loading.finish('load');
                }


            });
        }

        // END CHART ----------------------------------------------------------------------------


        // Volume Total -------------------------------------------------------------------------

        $scope.montaTotalAnual = function () {
            DashboardService.GetDahsTotal($scope.selectedPeriodoAno).then(function (response) {
                var data = response.data;
                if (data != null) {
                    $scope.volumeTotal = data.volumeTotal;
                    $loading.finish('load');
                }
            });
        }
        // --------------------------------------------------------------------------------------

        // Volume Total Mensal ------------------------------------------------------------------

        $scope.GetTotalMensal = function () {
            var periodo = '01/' + $scope.selectedPeriodo;
            DashboardService.GetDahsTotalMensal(periodo).then(function (response) {
                var data = response.data;

                if (data != null) {
                    $scope.volumeTotalMensalCreditavel = data.volumeTotalCreditavel;
                    $scope.volumeTotalMensalNaoCreditavel = data.volumeTotalNaoCreditavel;
                }
            });
        }

        // --------------------------------------------------------------------------------------

        $scope.chosenTab = function (tab) {
            if ($scope.lstPeriodo.length > 0) {
                $loading.start('load');

                $scope.tab = tab;

                $scope.selectedPeriodo = $scope.lstPeriodo[0].mesCompetencia;
                if (tab == 2 && $scope.selectedPeriodo != "") {
                    $scope.montaDoughnuts();
                    $scope.GetTotalMensal();
                } else {
                    $scope.montaDashsLine();
                }
            } else {
                SweetAlert.swal({
                    title: "Atenção!",
                    type: "warning",
                    text: "Nenhum dado mensal a ser exibido."
                });
            }
        }

        $scope.seletedDate = function () {
            $loading.start('load');

            $scope.montaDoughnuts();
            $scope.GetTotalMensal();
        }

        $scope.seletedYear = function () {
            $loading.start('load');

            $scope.montaDashsLine();
            $scope.montaTotalAnual();
        }

    })
    .controller('LoginCtrl', function ($scope, toaster, AuthService, $loading, $localStorage) {
        $onInit = function () {
            $scope.tipo = "PF";
            $localStorage.$reset();
        };

        $scope.user = {
            CpfCnpj: '',
            Senha: '',
            codigoAcesso: ''
        }

        $scope.verificaCpfCnpj = function () {
            $loading.start('load');

            if ($localStorage.user != undefined) {
                var cpfCnpj = $scope.user.CpfCnpj.replace('.', '').replace('.', '').replace('-', '');
                if ($localStorage.user.userName == cpfCnpj) {
                    if ($localStorage.user.message.includes('primeiro acesso')) {
                        $scope.isCodeAccess = true;
                    } else {
                        $scope.isCodeAccess = false;
                    }
                } else {
                    $scope.isCodeAccess = false;
                }
            } else {
                $scope.isCodeAccess = false;
            }

            $loading.finish('load');
        }

        $scope.tipos = [
            { tipo: "PF", nome: "Pessoa Fisica" },
            { tipo: "PJ", nome: "Pessoa Juridica" }
        ];

        $scope.autenticar = function (user) {

            if ($scope.loginForm.$error.cpf != undefined && $scope.tipo == "PF") {
                toaster.pop({
                    type: 'error',
                    title: 'CPF',
                    body: "Preencha um CPF válido",
                    showCloseButton: true,
                    timeout: 5000
                });
            }
            else if ($scope.loginForm.$error.cnpj != undefined && $scope.tipo == "PJ") {
                toaster.pop({
                    type: 'error',
                    title: 'CNPJ',
                    body: "Preencha um CNPJ válido",
                    showCloseButton: true,
                    timeout: 5000
                });
            }
            else {
                $scope.loginForm.$removeControl(this);
                AuthService.logar(user);                
            }
        }
    })
    .controller('RegisterCtrl', function ($scope, toaster, $loading, AuthService, $q, $timeout) {

        $scope.user = {
            CpfCnpj: "",
            Email: "",
            Senha: "",
            SenhaConfirmacao: ""
        };

        $onInit = function () {
            $scope.tipo = "PF";
        };
        $scope.tipos = [
            { tipo: "PF", nome: "Pessoa Fisica" },
            { tipo: "PJ", nome: "Pessoa Juridica" }
        ]

        $scope.RedefinirUsuario = function (user) {
            $loading.start('load');
            AuthService.RedefinirSenha(user);
        }

        $scope.CriarUsuario = function (user) {
            AuthService.cadastrar(user);
        }
    })
    .controller('topNavCtrl', function ($scope, $localStorage, $http, $uibModal, SweetAlert) {

        //if ($localStorage.user == undefined) {
        //    window.location = "#/login";
        //}

        $scope.user = $localStorage.user.userName.split('-')[1];


        $scope.logout = function () {
            $localStorage.$reset();
        }

        $scope.changepassword = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'Views/modal/change_password.html',
                controller: 'changePasswordInstanceCtrl',
                windowClass: "animated fadeIn",
                resolve: {
                    UserLogin: function () {
                        return $localStorage.user;
                    }
                }
            }).result.then(function () {
                SweetAlert.swal({
                    title: "Sucesso!",
                    text: "A senha foi alterada com sucesso",
                    type: "success",
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "OK",
                })
            });
        };
    })
    .controller('consorcioCtrl', function ($scope, DTOptionsBuilder, $uibModal, $localStorage, ConsortiumService, $q, SweetAlert) {

        $scope.GetAll = function () {
            var GetList = ConsortiumService.GetConsorcio();

            $q.all([GetList]).then(function (response) {
                $scope.getData = response[0].data;

            });
        }

        $scope.GetAll();

        $scope.dtOptions = DTOptionsBuilder.newOptions()
            .withDOM('<"html5buttons"B>lTfgitp')
            .withButtons([
                { extend: 'copy' },
                { extend: 'csv' },
                { extend: 'excel', title: 'ExampleFile' },
                { extend: 'pdf', title: 'ExampleFile' },

                {
                    extend: 'print',
                    customize: function (win) {
                        $(win.document.body).addClass('white-bg');
                        $(win.document.body).css('font-size', '10px');

                        $(win.document.body).find('table')
                            .addClass('compact')
                            .css('font-size', 'inherit');
                    }
                }
            ]);


        $scope.btnAdd = function () {

            $uibModal.open({
                scope: $scope,
                templateUrl: 'views/modal/consorcio/incluir_editar_consorcio.html',
                controller: function ($scope, $uibModalInstance, SweetAlert, consorcioSelected, ConsortiumService) {
                    $scope.Incluir = function () {
                        $scope.value = consorcioSelected;
                        ConsortiumService.Create($scope.obj)
                        SweetAlert.swal({
                            title: "Sucesso!",
                            text: "valores alterados com sucesso",
                            type: "success"
                        });
                        $uibModalInstance.close();

                    }

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                windowClass: "animated fadeIn",
                resolve: {
                    consorcioSelected: function () {
                        return null;
                    }
                }
            }).result.then(function (result) {
                $scope.GetAll();
            })
        }

        $scope.editar = function (data) {
            $uibModal.open({
                scope: $scope,
                templateUrl: 'views/modal/consorcio/incluir_editar_consorcio.html',
                controller: function ($scope, $uibModalInstance, consorcioSelected, SweetAlert, ConsortiumService) {
                    $scope.obj = {};
                    $scope.value = consorcioSelected;
                    $scope.obj.Descricao = consorcioSelected.descricao;


                    $scope.Alterar = function () {
                        consorcioSelected.descricao = $scope.obj.Descricao;
                        ConsortiumService.Edit(consorcioSelected).then(function (data) {
                            SweetAlert.swal({
                                title: "Sucesso!",
                                text: "valores alterados com sucesso",
                                type: "success"
                            });
                            $uibModalInstance.dismiss('dimiss');
                        })

                    }

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                windowClass: "animated fadeIn",
                resolve: {
                    consorcioSelected: function () {
                        return data;
                    }
                }
            })
                .result.then(function (result) {
                    $scope.GetAll();
                });
        }

        $scope.ativarDesativar = function (data) {
            $scope.title = !data.ativo ? "ativar" : "desativar";
            $scope.result = !data.ativo ? "ativada" : "desativada";

            SweetAlert.swal({
                title: "Deseja " + $scope.title + " " + data.descricao + " ?",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Sim, " + $scope.title + " !",
                cancelButtonText: "Não, cancelar!",
                closeOnConfirm: false,
                closeOnCancel: false
            },
                function (isConfirm) {
                    if (isConfirm) {
                        ConsortiumService.EnableDisable(data).then(function (data) {
                            SweetAlert.swal({
                                title: "Alterado!",
                                text: "valores alterados com sucesso",
                                type: "success"
                            });
                            $scope.GetAll();
                        })
                    } else {
                        SweetAlert.swal({
                            title: "Cancelado!",
                            text: "Você cancelou a alteração do registro",
                            type: "error"
                        });
                    }
                });
        }

        $scope.Incluir = function () {
            ConsortiumService.CadConsorcio($scope.consorcio);

        }
    })
    .controller('JVCtrl', function ($scope, DTOptionsBuilder, $uibModal, SweetAlert, $localStorage, ConsortiumJvService, ConsortiumService, $q) {

        $scope.GetAll = function () {
            ConsortiumJvService.GetAll().then(function (data) {
                $scope.lst = data
            });
        }

        $scope.GetListConsorcio = function () {
            ConsortiumService.GetConsorcio().then(function (data) {
                $scope.lstConsorcio = data.data
            })
        }

        $scope.GetAll();
        $scope.GetListConsorcio();


        $scope.dtOptions = DTOptionsBuilder.newOptions()
            .withDOM('<"html5buttons"B>lTfgitp')
            .withButtons([
                { extend: 'copy' },
                { extend: 'csv' },
                { extend: 'excel', title: 'ExampleFile' },
                { extend: 'pdf', title: 'ExampleFile' },

                {
                    extend: 'print',
                    customize: function (win) {
                        $(win.document.body).addClass('white-bg');
                        $(win.document.body).css('font-size', '10px');

                        $(win.document.body).find('table')
                            .addClass('compact')
                            .css('font-size', 'inherit');
                    }
                }
            ]);


        $scope.btnAddJv = function () {
            $uibModal.open({
                scope: $scope,
                templateUrl: 'views/modal/consorcio/incluir_editar_consorcioJV.html',
                controller: function ($scope, $uibModalInstance, jvSelected) {
                    $scope.Incluir = function () {
                        $scope.obj.Planilha = parseInt($scope.obj.Planilha);
                        ConsortiumJvService.CreateJv($scope.obj).then(function (data) {
                            SweetAlert.swal({
                                title: "Sucesso!",
                                text: "valores alterados com sucesso",
                                type: "success"
                            });
                            $uibModalInstance.close();
                        })
                    }

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                windowClass: "animated fadeIn",
                resolve: {
                    jvSelected: function () {
                        return null;
                    }
                }
            })
                .result.then(function (result) {
                    $scope.GetAll();
                });
        }

        $scope.editar = function (data) {
            $uibModal.open({
                scope: $scope,
                templateUrl: 'views/modal/consorcio/incluir_editar_consorcioJV.html',
                controller: function ($scope, $uibModalInstance, jvSelected) {
                    $scope.obj = {};
                    $scope.value = jvSelected;

                    $scope.obj.ConsorcioId = jvSelected.consorcioId;
                    $scope.obj.JV = jvSelected.jv;
                    $scope.obj.SituacaoJV = jvSelected.situacaoJV;
                    $scope.obj.Cutback = jvSelected.cutback;
                    $scope.obj.Planilha = jvSelected.planilha.toString();

                    $scope.Alterar = function () {
                        jvSelected.consorcioId = $scope.obj.ConsorcioId
                        jvSelected.jv = $scope.obj.JV;
                        jvSelected.situacaoJV = $scope.obj.SituacaoJV;
                        jvSelected.cutback = $scope.obj.Cutback;
                        jvSelected.planilha = $scope.obj.Planilha;

                        ConsortiumJvService.EditJv(jvSelected).then(function (data) {
                            SweetAlert.swal({
                                title: "Sucesso!",
                                text: "valores alterados com sucesso",
                                type: "success"
                            });
                            $uibModalInstance.close();
                        })
                        $uibModalInstance.close();
                    }

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };

                },
                windowClass: "animated fadeIn",
                resolve: {
                    jvSelected: function () {
                        return data;
                    }
                }
            })
                .result.then(function (result) {
                    $scope.GetAll();
                });
        }

        $scope.ativarDesativar = function (data) {
            $scope.title = !data.ativo ? "ativar" : "desativar";
            $scope.result = !data.ativo ? "ativada" : "desativada";

            SweetAlert.swal({
                title: "Deseja " + $scope.title + " " + data.jv + " ?",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Sim, " + $scope.title + " !",
                cancelButtonText: "Não, cancelar!",
                closeOnConfirm: false,
                closeOnCancel: false
            },
                function (isConfirm) {
                    if (isConfirm) {
                        ConsortiumJvService.EnableDisable(data).then(function (data) {
                            SweetAlert.swal({
                                title: "Alterado!",
                                text: "valores alterados com sucesso",
                                type: "success"
                            });
                            $scope.GetAll();
                        })
                    } else {
                        SweetAlert.swal({
                            title: "Cancelado!",
                            text: "Você cancelou a alteração do registro",
                            type: "error"
                        });
                    }
                });
        }

    })
    .controller('cfopCtrl', function ($scope, DTOptionsBuilder, $uibModal, SweetAlert, $localStorage, CfopService, $q) {

        $scope.GetAllCfops = function () {
            var GetList = CfopService.GetList();

            $q.all([GetList]).then(function (response) {
                $scope.cfops = response[0].data;
            });
        }

        $scope.GetAllCfops();

        $scope.dtOptions = DTOptionsBuilder.newOptions()
            .withDOM('<"html5buttons"B>lTfgitp')
            .withButtons([
                { extend: 'copy' },
                { extend: 'csv' },
                { extend: 'excel', title: 'ExampleFile' },
                { extend: 'pdf', title: 'ExampleFile' },

                {
                    extend: 'print',
                    customize: function (win) {
                        $(win.document.body).addClass('white-bg');
                        $(win.document.body).css('font-size', '10px');

                        $(win.document.body).find('table')
                            .addClass('compact')
                            .css('font-size', 'inherit');
                    }
                }
            ]);

        $scope.novo = function () {
            $uibModal.open({
                scope: $scope,
                templateUrl: 'views/modal/Cfop/incluir_editar_cfop.html',
                controller: function ($scope, $uibModalInstance, SweetAlert) {
                    $scope.Incluir = function () {
                        CfopService.Create($scope.obj).then(function (data) {
                            SweetAlert.swal({
                                title: "Sucesso!",
                                text: "valores alterados com sucesso",
                                type: "success"
                            });
                            $uibModalInstance.close();
                        })

                    }

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                windowClass: "animated fadeIn",
                resolve: {
                    CfopService: function () {
                        return null;
                    }
                }
            }).result.then(function (result) {
                $scope.GetAllCfops();
            });

        }

        $scope.editar = function (data) {
            $uibModal.open({
                scope: $scope,
                templateUrl: 'views/modal/Cfop/incluir_editar_cfop.html',
                controller: function ($scope, $uibModalInstance, CfopSelected, SweetAlert) {
                    $scope.obj = {};
                    $scope.value = CfopSelected;
                    $scope.obj.numeracao = CfopSelected.numeracao;
                    $scope.obj.descricao = CfopSelected.descricao;
                    $scope.obj.entradaSaida = CfopSelected.entradaSaida;
                    $scope.obj.credito = CfopSelected.credito

                    $scope.Alterar = function () {
                        CfopSelected.numeracao = $scope.obj.numeracao
                        CfopSelected.descricao = $scope.obj.descricao;
                        CfopSelected.entradaSaida = $scope.obj.entradaSaida;
                        CfopSelected.credito = $scope.obj.credito;

                        CfopService.Edit(CfopSelected).then(function (data) {
                            SweetAlert.swal({
                                title: "Sucesso!",
                                text: "valores alterados com sucesso",
                                type: "success"
                            });
                            $uibModalInstance.dismiss('dimiss');
                        })

                    }

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                windowClass: "animated fadeIn",
                resolve: {
                    CfopSelected: function () {
                        return data;
                    }
                }
            })
                .result.then(function (result) {
                    $scope.GetAllCfops();
                });
        }

        // Função só esta sendo chamada, mas não a correta, criar a função de desativar no backend

        $scope.ativarDesativar = function (data) {
            $scope.title = !data.ativo ? "ativar" : "desativar";
            $scope.result = !data.ativo ? "ativada" : "desativada";

            SweetAlert.swal({
                title: "Deseja " + $scope.title + " " + data.descricao + " ?",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Sim, " + $scope.title + " !",
                cancelButtonText: "Não, cancelar!",
                closeOnConfirm: false,
                closeOnCancel: false
            },
                function (isConfirm) {
                    if (isConfirm) {
                        CfopService.EnableDisable(data).then(function (data) {
                            SweetAlert.swal({
                                title: "Alterado!",
                                text: "valores alterados com sucesso",
                                type: "success"
                            });
                            $scope.GetAllCfops();
                        })
                    } else {
                        SweetAlert.swal({
                            title: "Cancelado!",
                            text: "Você cancelou a alteração do registro",
                            type: "error"
                        });
                    }
                });
        }

    })
    .controller('NCMCtrl', function ($scope, DTOptionsBuilder, $uibModal, SweetAlert, $localStorage, NCMService, $q) {

        $scope.GetAll = function () {
            var GetList = NCMService.GetList();

            $q.all([GetList]).then(function (response) {
                $scope.ncms = response[0].data;
                //$scope.consorcioList = response[1].data;

            });
        }

        $scope.GetAll();

        $scope.dtOptions = DTOptionsBuilder.newOptions()
            .withDOM('<"html5buttons"B>lTfgitp')
            .withButtons([
                { extend: 'copy' },
                { extend: 'csv' },
                { extend: 'excel', title: 'ExampleFile' },
                { extend: 'pdf', title: 'ExampleFile' },

                {
                    extend: 'print',
                    customize: function (win) {
                        $(win.document.body).addClass('white-bg');
                        $(win.document.body).css('font-size', '10px');

                        $(win.document.body).find('table')
                            .addClass('compact')
                            .css('font-size', 'inherit');
                    }
                }
            ]);


        $scope.novo = function () {
            $uibModal.open({
                scope: $scope,
                templateUrl: 'views/modal/NCM/incluir_editar_ncm.html',
                controller: function ($scope, $uibModalInstance, ncmSelected, NCMService) {

                    $scope.dateOptions = {
                        formatYear: 'yy',
                        startingDay: 1
                    };

                    $scope.inlineOptions = {
                        customClass: getDayClass,
                        minDate: new Date(),
                        showWeeks: true
                    };

                    $scope.format = 'dd/MM/yyyy'

                    $scope.toggleMin = function () {
                        $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
                        $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
                    };

                    $scope.toggleMin();

                    $scope.open1 = function () {
                        $scope.popup1.opened = true;
                    };

                    $scope.open2 = function () {
                        $scope.popup2.opened = true;
                    };

                    $scope.setDate = function (year, month, day) {
                        $scope.dt = new Date(year, month, day);
                    };

                    $scope.popup1 = {
                        opened: false
                    };

                    $scope.popup2 = {
                        opened: false
                    };

                    function getDayClass(data) {
                        var date = data.date,
                            mode = data.mode;
                        if (mode === 'day') {
                            var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

                            for (var i = 0; i < $scope.events.length; i++) {
                                var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

                                if (dayToCheck === currentDay) {
                                    return $scope.events[i].status;
                                }
                            }
                        }

                        return '';
                    }

                    $scope.Incluir = function () {
                        $scope.value = ncmSelected;
                        NCMService.Create($scope.obj).then(function (data) {
                            SweetAlert.swal({
                                title: "Sucesso!",
                                text: "valores alterados com sucesso",
                                type: "success"
                            });
                            $uibModalInstance.close();
                        });
                    }

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                windowClass: "animated fadeIn",
                resolve: {
                    ncmSelected: function () {
                        return null;
                    }
                }
            }).result.then(function (result) {
                $scope.GetAll();
            });
        }

        $scope.editar = function (data) {
            $uibModal.open({
                scope: $scope,
                templateUrl: 'views/modal/NCM/incluir_editar_ncm.html',
                controller: function ($scope, $uibModalInstance, ncmSelected, NCMService) {

                    $scope.parseISOString = function (d) {
                        var b = d.split(/\D+/);
                        return new Date(Date.UTC(b[0], --b[1], ++b[2], b[3], b[4], b[5]));
                    }

                    $scope.dateOptions = {
                        formatYear: 'yy',
                        startingDay: 1
                    };

                    $scope.inlineOptions = {
                        customClass: getDayClass,
                        minDate: new Date(),
                        showWeeks: true
                    };

                    $scope.format = 'dd/MM/yyyy'

                    $scope.toggleMin = function () {
                        $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
                        $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
                    };

                    $scope.toggleMin();

                    $scope.open1 = function () {
                        $scope.popup1.opened = true;
                    };

                    $scope.open2 = function () {
                        $scope.popup2.opened = true;
                    };

                    $scope.setDate = function (year, month, day) {
                        $scope.dt = new Date(year, month, day);
                    };

                    $scope.popup1 = {
                        opened: false
                    };

                    $scope.popup2 = {
                        opened: false
                    };

                    function getDayClass(data) {
                        var date = data.date,
                            mode = data.mode;
                        if (mode === 'day') {
                            var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

                            for (var i = 0; i < $scope.events.length; i++) {
                                var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

                                if (dayToCheck === currentDay) {
                                    return $scope.events[i].status;
                                }
                            }
                        }

                        return '';
                    }

                    $scope.obj = {};

                    $scope.value = ncmSelected;

                    $scope.obj.codigo = ncmSelected.codigo;
                    $scope.obj.descricao = ncmSelected.descricao
                    $scope.obj.credito = ncmSelected.credito;
                    $scope.obj.dataInicio = $scope.parseISOString(ncmSelected.dataInicio);
                    $scope.obj.dataFim = $scope.parseISOString(ncmSelected.dataFim);
                    $scope.obj.ano = ncmSelected.ano

                    $scope.Alterar = function () {
                        ncmSelected.codigo = $scope.obj.codigo;
                        ncmSelected.descricao = $scope.obj.descricao;
                        ncmSelected.credito = $scope.obj.credito;
                        ncmSelected.dataInicio = $scope.obj.dataInicio;
                        ncmSelected.dataFim = $scope.obj.dataFim;
                        ncmSelected.ano = $scope.obj.ano;

                        NCMService.Edit(ncmSelected).then(function () {
                            SweetAlert.swal({
                                title: "Sucesso!",
                                text: "valores alterados com sucesso",
                                type: "success"
                            });
                            $uibModalInstance.close();
                        })
                    }

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                windowClass: "animated fadeIn",
                resolve: {
                    ncmSelected: function () {
                        return data;
                    }
                }
            }).result.then(function (result) {
                $scope.GetAll();
            });
        }

        $scope.ativarDesativar = function (data) {
            $scope.title = !data.ativo ? "ativar" : "desativar";
            $scope.result = !data.ativo ? "ativada" : "desativada";

            SweetAlert.swal({
                title: "Deseja " + $scope.title + " " + data.descricao + " ?",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Sim, " + $scope.title + " !",
                cancelButtonText: "Não, cancelar!",
                closeOnConfirm: false,
                closeOnCancel: false
            },
                function (isConfirm) {
                    if (isConfirm) {
                        NCMService.EnableDisable(data).then(function (data) {
                            SweetAlert.swal({
                                title: "Alterado!",
                                text: "valores alterados com sucesso",
                                type: "success"
                            });
                            $scope.GetAll();
                        })
                    } else {
                        SweetAlert.swal({
                            title: "Cancelado!",
                            text: "Você cancelou a alteração do registro",
                            type: "error"
                        });
                    }
                });
        }
    })
    .controller('metaobjCtrl', function ($scope, DTOptionsBuilder, $uibModal, SweetAlert, $localStorage, MetaObjetoService, $q) {

        $scope.GetAll = function () {
            var GetList = MetaObjetoService.GetMetaObjs();

            $q.all([GetList]).then(function (response) {
                $scope.metaObj = response[0].data;
            });
        }

        $scope.GetAll();

        $scope.dtOptions = DTOptionsBuilder.newOptions()
            .withDOM('<"html5buttons"B>lTfgitp')
            .withButtons([
                { extend: 'copy' },
                { extend: 'csv' },
                { extend: 'excel', title: 'ExampleFile' },
                { extend: 'pdf', title: 'ExampleFile' },

                {
                    extend: 'print',
                    customize: function (win) {
                        $(win.document.body).addClass('white-bg');
                        $(win.document.body).css('font-size', '10px');

                        $(win.document.body).find('table')
                            .addClass('compact')
                            .css('font-size', 'inherit');
                    }
                }
            ]);


        $scope.novo = function () {
            $uibModal.open({
                scope: $scope,
                templateUrl: 'views/modal/Meta/incluir_editar_metaobj.html',
                controller: function ($scope, $uibModalInstance, MetaObjetoService, metaSelected) {

                    $scope.Incluir = function () {
                        $scope.value = metaSelected;


                        MetaObjetoService.Create($scope.obj).then(function (data) {
                            SweetAlert.swal({
                                title: "Sucesso!",
                                text: "valores alterados com sucesso",
                                type: "success"
                            });
                            $uibModalInstance.close();
                        })
                    }

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                windowClass: "animated fadeIn",
                resolve: {
                    metaSelected: function () {
                        return null;
                    }
                }
            }).result.then(function (result) {
                $scope.GetAll();
            });
        }

        $scope.editar = function (data) {
            $uibModal.open({
                scope: $scope,
                templateUrl: 'views/modal/Meta/incluir_editar_metaobj.html',
                controller: function ($scope, $uibModalInstance, metaSelected, MetaObjetoService) {
                    $scope.value = metaSelected;
                    $scope.obj = {};
                    $scope.obj.descricao = metaSelected.descricao;
                    $scope.obj.credito = metaSelected.credito

                    $scope.Alterar = function () {
                        metaSelected.descricao = $scope.obj.descricao;
                        metaSelected.credito = $scope.obj.credito;

                        MetaObjetoService.Edit(metaSelected).then(function () {
                            SweetAlert.swal({
                                title: "Sucesso!",
                                text: "valores alterados com sucesso",
                                type: "success"
                            });
                            $uibModalInstance.close();
                        })
                    }

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                windowClass: "animated fadeIn",
                resolve: {
                    metaSelected: function () {
                        return data;
                    }
                }
            }).result.then(function (result) {
                $scope.GetAll();
            });
        }

        $scope.ativarDesativar = function (data) {
            $scope.title = !data.ativo ? "ativar" : "desativar";
            $scope.result = !data.ativo ? "ativada" : "desativada";

            SweetAlert.swal({
                title: "Deseja " + $scope.title + " " + data.descricao + " ?",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Sim, " + $scope.title + " !",
                cancelButtonText: "Não, cancelar!",
                closeOnConfirm: false,
                closeOnCancel: false
            },
                function (isConfirm) {
                    if (isConfirm) {
                        MetaObjetoService.EnableDisable(data).then(function (data) {
                            SweetAlert.swal({
                                title: "Alterado!",
                                text: "valores alterados com sucesso",
                                type: "success"
                            });
                            $scope.GetAll();
                        })
                    } else {
                        SweetAlert.swal({
                            title: "Cancelado!",
                            text: "Você cancelou a alteração do registro",
                            type: "error"
                        });
                    }
                });
        }
    })
    .controller('textoCtrl', function ($scope, DTOptionsBuilder, $uibModal, SweetAlert, $localStorage, TextoService, $q, $loading) {

        $scope.obj = { pageNumber: 1, pageSize: 10, "filtroTextoBreve": { Texto: "" } }
        $scope.maxSize = 10;
        $scope.currentPage = 1;
        $scope.numPerPage = $scope.obj.pageSize;
        $scope.totalRecords = 0;

        $scope.GetAll = function (d) {
            $loading.start('load');
            TextoService.GetAllPaginate(d).then(function (data) {
                $scope.textos = data.data;
                $scope.totalRecords = data.totalRecords;
                $loading.finish('load');
            })
        }

        $scope.GetAll($scope.obj);

        $scope.pageChanged = function () {
            $scope.obj.pageNumber = $scope.currentPage;
            $scope.GetAll($scope.obj);
        }

        $scope.incluir = function () {
            $uibModal.open({
                scope: $scope,
                templateUrl: 'views/modal/Texto/incluir_editar_texto.html',
                controller: function ($scope, $uibModalInstance, TextoService) {
                    $scope.IncluirJv = function () {
                        $scope.value = null;
                        var texto = {
                            descricao: $scope.obj.descricao,
                            creditavel: $scope.obj.creditavel == "false" ? false : true
                        }
                        TextoService.Create(texto).then(function (response) {
                            $uibModalInstance.close();
                            SweetAlert.swal({
                                title: "Sucesso!",
                                type: "success",
                                text: response.data.message
                            });
                        });
                    }

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                windowClass: "animated fadeIn",
                resolve: {
                    textoSelected: function () {
                        return null;
                    }
                }
            });
        }

        $scope.editar = function (data) {
            $uibModal.open({
                scope: $scope,
                templateUrl: 'views/modal/Texto/incluir_editar_texto.html',
                controller: function ($scope, $uibModalInstance, textoSelected, TextoService) {
                    $scope.obj = {};
                    $scope.value = data;
                    $scope.obj.descricao = textoSelected.descricao;
                    $scope.obj.creditavel = textoSelected.creditavel.toString();

                    $scope.editarJv = function () {
                        textoSelected.descricao = $scope.obj.descricao;
                        textoSelected.creditavel = $scope.obj.creditavel == "true" ? true : false;

                        TextoService.Edit(textoSelected).then(function (response) {
                            if (response.data.success) {
                                $uibModalInstance.dismiss('dimiss');
                                SweetAlert.swal({
                                    title: "Sucesso!",
                                    type: "success",
                                    text: response.data.message
                                });
                            } else {
                                $uibModalInstance.dismiss('dimiss');
                                SweetAlert.swal({
                                    title: "ERRO!",
                                    type: "error",
                                    text: response.data.message
                                });
                            }
                        }, function (error) {
                            angular.forEach(error.data, function (value, index) {
                                if (index == 'errors') {
                                    $uibModalInstance.dismiss('dimiss');
                                    SweetAlert.swal({
                                        title: "ERRO!",
                                        type: "error",
                                        text: "Erro ao atulaizar texto breve."
                                    });

                                    console.log("Erro ao atulaizar texto breve: " + JSON.stringify(error.data[index]));
                                }
                            });
                        });

                    }

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                windowClass: "animated fadeIn",
                resolve: {
                    textoSelected: function () {
                        return data;
                    }
                }
            });
        }

        $scope.ativarDesativar = function (data) {
            $scope.title = !data.ativo ? "ativar" : "desativar";
            $scope.result = !data.ativo ? "ativada" : "desativada";

            SweetAlert.swal({
                title: "Deseja " + $scope.title + " " + data.descricao + " ?",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Sim, " + $scope.title + " !",
                cancelButtonText: "Não, cancelar!",
                closeOnConfirm: false,
                closeOnCancel: false
            },
                function (isConfirm) {
                    if (isConfirm) {
                        TextoService.EnableDisable(data).then(function (data) {
                            SweetAlert.swal({
                                title: "Alterado!",
                                text: "valores alterados com sucesso",
                                type: "success"
                            });
                            $scope.GetAll($scope.obj);
                        })
                    } else {
                        SweetAlert.swal({
                            title: "Cancelado!",
                            text: "Você cancelou a alteração do registro",
                            type: "error"
                        });
                    }
                });
        }

        $scope.limparFiltro = function () {
            $scope.obj.filtroTextoBreve.Texto = "";
            $scope.GetAll($scope.obj);
        }
        $scope.filtrar = function () {
            $scope.GetAll($scope.obj);
        }

    })
    .controller('ConsolidadoCtrl', function ($scope, RelatoriosService, DTOptionsBuilder, $q, SweetAlert, $loading, $timeout) {

        $loading.start('load');
        $scope.dtOptions = DTOptionsBuilder.newOptions()
            .withDOM('<"html5buttons"B>lTfgitp')
            .withOption('order', [])
            .withButtons([
                {
                    extend: 'print',
                    customize: function (win) {
                        $(win.document.body).addClass('white-bg');
                        $(win.document.body).css('font-size', '10px');

                        $(win.document.body).find('table')
                            .addClass('compact')
                            .css('font-size', 'inherit');
                    }
                }
            ]);

        var list = RelatoriosService.GetProcessedReports();
        var listPeriodo = RelatoriosService.GetImportedFiles();
        $scope.dtProcessamento = '';

        $q.all([list, listPeriodo]).then(function (response) {
            $scope.GetFiles = response[0].data;
            $scope.lstPeriodo = response[1].data;
            $loading.finish('load');
        });

        $scope.btnGerar = function (date, flagReproc, action) {
            $loading.start('load');

            if (date == '') {
                if (action == 'gerar') {
                    $loading.finish('load');
                    SweetAlert.swal({
                        title: 'Selecione um mês de competência válido.',
                        type: "error",
                        showCancelButton: false,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "OK",
                        closeOnConfirm: false,
                        closeOnCancel: false
                    });

                    return;
                }
            }

            //date = '01/' + date;
            var reproc = flagReproc == 1 ? true : false;
            var getExcel = RelatoriosService.CreateExcel(date, reproc);

            $q.all([getExcel]).then(function (response) {

                if (response[0] != undefined) {

                    const blob = response[0].data;
                    var url = window.URL.createObjectURL(blob);
                    var a = document.createElement("a");
                    document.body.appendChild(a);
                    a.href = url;
                    a.download = "Consolidação Relatórios de Gastos.xlsx";
                    a.click();

                    $loading.finish('load');
                } else {
                    //$timeout(function () {
                    //    window.location.reload();
                    //}, 10000);

                    $loading.finish('load');
                    SweetAlert.swal({
                        title: "Atenção!",
                        type: "warning",
                        text: "Algo deu errado na sua solicitação. Tente novamente mais tarde ou entre em contato com o suporte."
                    });
                }
            }, function (error) {
                console.log(error);
                $loading.finish('load');
            });

        }

    })
    .controller('ResumoCtrl', function ($scope, DTOptionsBuilder, $loading, SweetAlert, $q, RelatoriosService) {

        $scope.dtProcessamento = '';
        $scope.isFiltered = false;
        $scope.sumImobilizado = 0;
        $scope.sumBens = 0;
        $scope.sumServicos = 0;
        $scope.sumLocacao_06 = 0;
        $scope.sumLocacao_08 = 0;
        $scope.sumImobilizadoImp = 0;
        $scope.sumBensImp = 0;
        $scope.sumTotalBase = 0;

        $scope.GerarResumo = function (data) {
            $loading.start('load');

            if (data != '' && data != undefined) {

                var getResumo = RelatoriosService.GetResumo(data);

                $q.all([getResumo]).then(function (response) {
                    if (response[0].success) {
                        $scope.isFiltered = true;
                        var data = response[0].data;

                        angular.forEach(data, function (value) {

                            // totalizadores
                            $scope.sumImobilizado += parseFloat(value.imobilizado);
                            $scope.sumBens += parseFloat(value.bens);
                            $scope.sumServicos += parseFloat(value.servicos);
                            $scope.sumLocacao_06 += parseFloat(value.locacao_06);
                            $scope.sumLocacao_08 += parseFloat(value.locacao_08);
                            $scope.sumImobilizadoImp += parseFloat(value.imobilizadoImportacao);
                            $scope.sumBensImp += parseFloat(value.bensImportacao);
                            $scope.sumTotalBase += parseFloat(value.totalBase);

                            // coversão de valores
                            value.imobilizado = parseFloat(value.imobilizado);
                            value.bens = parseFloat(value.bens);
                            value.servicos = parseFloat(value.servicos);
                            value.locacao_06 = parseFloat(value.locacao_06);
                            value.locacao_08 = parseFloat(value.locacao_08);
                            value.imobilizadoImportacao = parseFloat(value.imobilizadoImportacao);
                            value.bensImportacao = parseFloat(value.bensImportacao);
                            value.totalBase = parseFloat(value.totalBase);
                        });

                        data.push({
                            "consorcio": "",
                            "jv": "",
                            "situacaoJV": "Totalizadores: ",
                            "imobilizado": $scope.sumImobilizado,
                            "bens": $scope.sumBens,
                            "servicos": $scope.sumServicos,
                            "locacao_06": $scope.sumLocacao_06,
                            "locacao_08": $scope.sumLocacao_08,
                            "imobilizadoImportacao": $scope.sumImobilizadoImp,
                            "bensImportacao": $scope.sumBensImp,
                            "totalBase": $scope.sumTotalBase
                        });
                        $scope.GetResumo = data;

                    } else {
                        SweetAlert.swal("Erro!", response[0].message, "error");
                    }

                    $loading.finish('load');
                });
            } else {
                $loading.finish('load');
                SweetAlert.swal("Atenção!", "Data de competência não pode ser vazio.", "warning");
            }
        };


        $scope.dtOptions = DTOptionsBuilder.newOptions()
            .withDOM('<"html5buttons"B>lTfgitp')
            .withDisplayLength(25)
            .withOption('order', [])
            .withOption('fnRowCallback',
                function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                    if (aData[2] == "Totalizadores:") {
                        nRow.attributes.class.value = "ng-scope row-dt-totals";
                    }
                    return nRow;
                })
            .withButtons([
                { extend: 'copy' },
                { extend: 'csv', title: 'Resumo_Creditos_' + $scope.dtProcessamento },
                { extend: 'excel', title: 'Resumo_Creditos_' + $scope.dtProcessamento },

                {
                    extend: 'print',
                    customize: function (win) {
                        $(win.document.body).addClass('white-bg');
                        $(win.document.body).css('font-size', '10px');

                        $(win.document.body).find('table')
                            .addClass('compact')
                            .css('font-size', 'inherit');
                    }
                }
            ]);
    })
    .controller('RelDuplicidadeCtrl', function ($scope, $uibModal, SweetAlert, $localStorage, RelatoriosService) {
        $scope.dateOptions = {
            formatYear: 'yy',
            maxDate: new Date(),
            minDate: new Date(),
            startingDay: 1
        };

        $scope.inlineOptions = {
            customClass: getDayClass,
            minDate: new Date(),
            showWeeks: true
        };

        $scope.format = 'MM/yyyy'

        $scope.toggleMin = function () {
            $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
            $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
            $scope.dateOptions.datepickerMode = "month";
            $scope.dateOptions.minMode = "month";
        };

        $scope.toggleMin();

        $scope.open1 = function () {
            $scope.popup1.opened = true;
        };

        $scope.popup1 = {
            opened: false
        };

        function getDayClass(data) {
            var date = data.date,
                mode = data.mode;
            if (mode === 'day') {
                var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

                for (var i = 0; i < $scope.events.length; i++) {
                    var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

                    if (dayToCheck === currentDay) {
                        return $scope.events[i].status;
                    }
                }
            }

            return '';
        }

        $scope.download = function () {
            var requestData = $scope.data;
            RelatoriosService.DownloadDuplicados(requestData);
        }
    })
    .controller('ImportacaoCtrl', function ($scope, DTOptionsBuilder, $loading, SweetAlert, $localStorage, RelatoriosService, $q) {

        $loading.start('load');
        var GetList = RelatoriosService.GetFiles();
        $scope.dataProcessamento = "";

        $q.all([GetList]).then(function (response) {
            $scope.GetFiles = response[0].data;
            $loading.finish('load');
        });

        $scope.dtOptions = DTOptionsBuilder.newOptions()
            .withDOM('<"html5buttons"B>lTfgitp')
            .withButtons([
                { extend: 'copy' },
                { extend: 'csv' },
                { extend: 'excel', title: 'ExampleFile' },
                { extend: 'pdf', title: 'ExampleFile' },

                {
                    extend: 'print',
                    customize: function (win) {
                        $(win.document.body).addClass('white-bg');
                        $(win.document.body).css('font-size', '10px');

                        $(win.document.body).find('table')
                            .addClass('compact')
                            .css('font-size', 'inherit');
                    }
                }
            ]);

        $scope.importarArquivo = function (file) {
            if ($scope.dataProcessamento == "") {
                SweetAlert.swal("Atenção!", "Data de processamento não pode ser vazio.", "warning");
            } else {

                $loading.start('load');
                var json = {
                    fileName: file.nomeArquivo,
                    yearsMonthProccess: $scope.dataProcessamento
                }

                var result = RelatoriosService.Importar(json);

                $q.all([result]).then(function (response) {
                    $loading.finish('load');
                    SweetAlert.swal("Boa!", response[0].message, "success");
                });
            }
        }
    })
    .controller('Importacao2Ctrl', function ($scope, DTOptionsBuilder, $loading, SweetAlert, $localStorage, ArquivoService, $uibModal) {

        $scope.GetAll = function () {
            $loading.start('load');
            ArquivoService.GetAll().then(function (data) {
                $scope.lstImportados = data.filter(function (x) {
                    return x.importado == true;
                })

                $scope.lst = data.filter(function (x) {
                    return x.importado == false;
                })

                $loading.finish('load');
            });
        }

        $scope.GetAll();

        $scope.dtOptions = DTOptionsBuilder.newOptions()
            .withDOM('<"html5buttons"B>lTfgitp')
            .withOption('order', [0, 'desc'])
            .withButtons([
                { extend: 'copy' },
                { extend: 'csv' },
                { extend: 'excel', title: 'ExampleFile' },
                { extend: 'pdf', title: 'ExampleFile' },

                {
                    extend: 'print',
                    customize: function (win) {
                        $(win.document.body).addClass('white-bg');
                        $(win.document.body).css('font-size', '10px');

                        $(win.document.body).find('table')
                            .addClass('compact')
                            .css('font-size', 'inherit');
                    }
                }
            ]);

        $scope.liberar = function (obj) {

            ArquivoService.EnableDisable(obj).then(function () {
                $scope.GetAll();
                $uibModalInstance.dismiss('dimiss');
                SweetAlert.swal({
                    title: "Sucesso!",
                    text: "valores alterados com sucesso",
                    type: "success"
                });
            });
        }

        $scope.liberarTodos = function () {
            $uibModal.open({
                scope: $scope,
                templateUrl: 'views/modal/Importacao/editar_arquivo.html',
                controller: function ($scope, $uibModalInstance, selected) {

                    $scope.value = selected;
                    $scope.obj = {};

                    $scope.dateOptions = {
                        formatYear: 'yy',
                        maxDate: new Date(),
                        minDate: new Date(),
                        startingDay: 1
                    };

                    $scope.inlineOptions = {
                        customClass: getDayClass,
                        minDate: new Date(),
                        showWeeks: true
                    };

                    $scope.format = 'MM/yyyy'

                    $scope.toggleMin = function () {
                        $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
                        $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
                        $scope.dateOptions.datepickerMode = "month";
                        $scope.dateOptions.minMode = "month";
                    };

                    $scope.toggleMin();

                    $scope.open1 = function () {
                        $scope.popup1.opened = true;
                    };

                    $scope.popup1 = {
                        opened: false
                    };

                    function getDayClass(data) {
                        var date = data.date,
                            mode = data.mode;
                        if (mode === 'day') {
                            var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

                            for (var i = 0; i < $scope.events.length; i++) {
                                var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

                                if (dayToCheck === currentDay) {
                                    return $scope.events[i].status;
                                }
                            }
                        }

                        return '';
                    }

                    $scope.AlterarTodos = function () {
                        SweetAlert.swal({
                            title: "Deseja liberar todos os arquivos de uma vez?",
                            type: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#DD6B55",
                            confirmButtonText: "Sim, liberar!",
                            cancelButtonText: "Não, cancelar!",
                            closeOnConfirm: false,
                            closeOnCancel: false
                        },
                            function (isConfirm) {
                                if (isConfirm) {
                                    ArquivoService.LiberarTodos($scope.obj.MesCompetencia.toLocaleDateString().substring(3, 10).replace('/', '%2F')).then(function (data) {
                                        $uibModalInstance.dismiss('dimiss');
                                        SweetAlert.swal({
                                            title: "Liberado!",
                                            text: "Os arquivos foram liberados com sucesso!",
                                            type: "success"
                                        });

                                        $scope.GetAll();
                                    })

                                } else {
                                    SweetAlert.swal({
                                        title: "Cancelado!",
                                        text: "Você cancelou a alteração do registro",
                                        type: "error"
                                    });
                                }
                            });
                    }

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                windowClass: "animated fadeIn",
                resolve: {
                    selected: function () {
                        return 1;
                    }
                }
            });
        }

        $scope.upload = function () {

            var formData = new FormData();

            for (var i = 0; i < document.getElementById('files').files.length; i++) {
                formData.append('files', document.getElementById('files').files[i]);
            }


            SweetAlert.swal({
                title: "Deseja fazer o upload dos arquivos?",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Sim!",
                cancelButtonText: "Não!",
                closeOnConfirm: true,
                closeOnCancel: false,
                showLoaderOnConfirm: true
            },
                function (isConfirm) {
                    if (isConfirm) {

                        $uibModal.open({
                            scope: $scope,
                            templateUrl: 'views/modal/Importacao/editar_arquivo.html',
                            controller: function ($scope, $uibModalInstance, selected) {
                                $scope.value = selected;

                                $scope.obj = {};

                                $scope.dateOptions = {
                                    formatYear: 'yy',
                                    maxDate: new Date(),
                                    minDate: new Date(),
                                    startingDay: 1
                                };

                                $scope.inlineOptions = {
                                    customClass: getDayClass,
                                    minDate: new Date(),
                                    showWeeks: true
                                };

                                $scope.format = 'MM/yyyy'

                                $scope.toggleMin = function () {
                                    $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
                                    $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
                                    $scope.dateOptions.datepickerMode = "month";
                                    $scope.dateOptions.minMode = "month";
                                };

                                $scope.toggleMin();

                                $scope.open1 = function () {
                                    $scope.popup1.opened = true;
                                };

                                $scope.popup1 = {
                                    opened: false
                                };

                                function getDayClass(data) {
                                    var date = data.date,
                                        mode = data.mode;
                                    if (mode === 'day') {
                                        var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

                                        for (var i = 0; i < $scope.events.length; i++) {
                                            var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

                                            if (dayToCheck === currentDay) {
                                                return $scope.events[i].status;
                                            }
                                        }
                                    }

                                    return '';
                                }

                                $scope.Alterar = function () {
                                    if ($scope.obj.MesCompetencia == undefined || $scope.obj.MesCompetencia == null) {
                                        SweetAlert.swal({
                                            title: "Atenção",
                                            text: "Preencha o mês da competência para liberar",
                                            type: "warning"
                                        });
                                    }
                                    else {

                                        var mesCompentencia = $scope.obj.MesCompetencia.toLocaleDateString().substring(3, 10);

                                        ArquivoService.Create(formData, mesCompentencia).then(function (data) {
                                            $uibModalInstance.dismiss('dimiss');
                                            SweetAlert.swal({
                                                title: "Arquivos enviados!",
                                                text: "Os arquivos foram enviados com sucesso!",
                                                type: "success"
                                            });
                                            $scope.GetAll();
                                        });
                                    }
                                }

                                $scope.cancel = function () {
                                    $uibModalInstance.dismiss('cancel');
                                };
                            },
                            windowClass: "animated fadeIn",
                            resolve: {
                                selected: function () {
                                    return;
                                }
                            }
                        });

                    } else {
                        $loading.finish('load');
                        SweetAlert.swal({
                            title: "Cancelado!",
                            text: "Solicitação cancelada!",
                            type: "error"
                        });
                    }
                });


        }

        $scope.importar = function (file) {
            $loading.start('load');
            ArquivoService.Importar(file.id).then(function (response) {

                var data = response.data;
                $loading.finish('load');

                if (!response.success) {
                    file.importado = false;
                    SweetAlert.swal({
                        title: "Erro!",
                        type: "error",
                        text: "Ocorreu um erro na importação do arquivo. Entre em contato com o suporte para maiores informações."
                    });
                } else {
                    file.importado = data.importado;
                    SweetAlert.swal({
                        title: "Sucesso!",
                        type: "success",
                        text: response.message
                    });

                    $scope.GetAll();
                }

            }, function (error) {
                $loading.finish('load');
                SweetAlert.swal({
                    title: "Erro!",
                    type: "error",
                    text: "Ocorreu um erro na importação do arquivo. Entre em contato com o suporte para maiores informações."
                });
            });
        };

        $scope.excluir = function (data) {
            SweetAlert.swal({
                title: "Deseja excluir o arquivo" + data.nomeArquivo + " ?",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Sim, excluir!",
                cancelButtonText: "Não, cancelar!",
                closeOnConfirm: false,
                closeOnCancel: false
            },
                function (isConfirm) {
                    if (isConfirm) {
                        ArquivoService.Delete(data).then(function (data) {
                            SweetAlert.swal({
                                title: "Excluído!",
                                text: "o arquivo foi excluido com sucesso",
                                type: "success"
                            });
                            $scope.GetAll();
                        })
                    } else {
                        SweetAlert.swal({
                            title: "Cancelado!",
                            text: "Você cancelou a alteração do registro",
                            type: "error"
                        });
                    }
                });
        }
    })
    .controller('ManualH01Ctrl', function ($scope, $uibModal, SweetAlert, DTOptionsBuilder, ManualService, $q, $http, $loading, SweetAlert) {
        $scope.obj = { pageNumber: 1, pageSize: 10, "filtroManual": { MesCompetencia: new Date(), Credito: "", TipoItem: "" } }
        $scope.maxSize = 10;
        $scope.currentPage = 1;
        $scope.numPerPage = $scope.obj.pageSize;
        $scope.totalRecords = 0;

        $scope.creditos = ["Creditável", "Não Creditável"];
        $scope.tiposCredito = ["01 - Imobilizado", "02 - Bens", "03 - Serviços", "06 - aluguel", "08 - aluguel", "01 - imobilizado importação", "02 - bens importação"];

        $scope.dateOptions = {
            formatYear: 'yy',
            maxDate: new Date(),
            minDate: new Date(),
            startingDay: 1
        };

        $scope.inlineOptions = {
            customClass: getDayClass,
            minDate: new Date(),
            showWeeks: true
        };

        $scope.format = 'MM/yyyy'

        $scope.toggleMin = function () {
            $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
            $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
            $scope.dateOptions.datepickerMode = "month";
            $scope.dateOptions.minMode = "month";
        };

        $scope.toggleMin();

        $scope.open1 = function () {
            $scope.popup1.opened = true;
        };

        $scope.popup1 = {
            opened: false
        };

        function getDayClass(data) {
            var date = data.date,
                mode = data.mode;
            if (mode === 'day') {
                var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

                for (var i = 0; i < $scope.events.length; i++) {
                    var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

                    if (dayToCheck === currentDay) {
                        return $scope.events[i].status;
                    }
                }
            }

            return '';
        }

        $scope.ObterPlanilha = function (d) {
            $loading.start('load');
            ManualService.GetH01(d).then(function (data) {
                $scope.listH01 = data.data;
                $scope.totalRecords = data.totalRecords;
                $loading.finish('load');
            })
        }

        $scope.ObterPlanilha($scope.obj);

        $scope.pageChanged = function () {
            $scope.obj.pageNumber = $scope.currentPage;
            $scope.ObterPlanilha($scope.obj);
        }

        $scope.editar = function (obj) {
            $uibModal.open({
                scope: $scope,
                templateUrl: 'views/modal/Manual/editar_manuais.html',
                controller: function ($scope, $uibModalInstance, manualSelected) {

                    $scope.obj = {};
                    $scope.obj.Creditos = manualSelected.creditos;
                    $scope.obj.TipoItem = manualSelected.tipoItem

                    $scope.alterar = function () {
                        manualSelected.creditos = $scope.obj.Creditos
                        manualSelected.tipoItem = $scope.obj.TipoItem ?? '';

                        ManualService.EditH01(manualSelected).then(function (response) {
                            if (response.success) {
                                $uibModalInstance.dismiss('dimiss');
                                SweetAlert.swal({
                                    title: "Sucesso!",
                                    type: "success",
                                    text: response.message
                                });
                            } else {
                                $uibModalInstance.dismiss('dimiss');
                                SweetAlert.swal({
                                    title: "ERRO!",
                                    type: "error",
                                    text: response.message
                                });
                            }
                        }, function (error) {
                            angular.forEach(error.data, function (value, index) {
                                if (index == 'errors') {
                                    $uibModalInstance.dismiss('dimiss');
                                    SweetAlert.swal({
                                        title: "ERRO!",
                                        type: "error",
                                        text: "Erro ao fazer o ajuste manual."
                                    });

                                    console.log("Erro ao fazer o ajuste manual: " + JSON.stringify(error.data[index]));
                                }
                            });
                        });

                    }

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                windowClass: "animated fadeIn",
                resolve: {
                    manualSelected: function () {
                        return obj;
                    }
                }
            });
        }

        $scope.dtOptions = DTOptionsBuilder.newOptions()
            .withDOM('<"html5buttons"B>lTfgitp')
            .withButtons([
                { extend: 'copy' },
                { extend: 'csv' },
                { extend: 'excel', title: 'Resumo_Creditos_' + $scope.dtProcessamento },

                {
                    extend: 'print',
                    customize: function (win) {
                        $(win.document.body).addClass('white-bg');
                        $(win.document.body).css('font-size', '10px');

                        $(win.document.body).find('table')
                            .addClass('compact')
                            .css('font-size', 'inherit');
                    }
                }
            ]);

        $scope.limparFiltro = function () {
            $scope.obj.filtroManual.MesCompetencia = new Date();
            $scope.obj.filtroManual.Credito = ""
            $scope.obj.filtroManual.TipoItem = ""
            $scope.GetAll($scope.obj);
        }
        $scope.filtrar = function () {

            $scope.ObterPlanilha($scope.obj);
        }
    })
    .controller('ManualH02Ctrl', function ($scope, $uibModal, SweetAlert, DTOptionsBuilder, ManualService, $q, $http, $loading) {
        $scope.obj = { pageNumber: 1, pageSize: 10, "filtroManual": { MesCompetencia: new Date(), Credito: "", TipoItem: "" } }
        $scope.maxSize = 10;
        $scope.currentPage = 1;
        $scope.numPerPage = $scope.obj.pageSize;
        $scope.totalRecords = 0;

        $scope.creditos = ["Creditável", "Não Creditável"];
        $scope.tiposCredito = ["01 - Imobilizado", "02 - Bens", "03 - Serviços", "06 - aluguel", "08 - aluguel", "01 - imobilizado importação", "02 - bens importação"];

        $scope.dateOptions = {
            formatYear: 'yy',
            maxDate: new Date(),
            minDate: new Date(),
            startingDay: 1
        };

        $scope.inlineOptions = {
            customClass: getDayClass,
            minDate: new Date(),
            showWeeks: true
        };

        $scope.format = 'MM/yyyy'

        $scope.toggleMin = function () {
            $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
            $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
            $scope.dateOptions.datepickerMode = "month";
            $scope.dateOptions.minMode = "month";
        };

        $scope.toggleMin();

        $scope.open1 = function () {
            $scope.popup1.opened = true;
        };

        $scope.popup1 = {
            opened: false
        };

        function getDayClass(data) {
            var date = data.date,
                mode = data.mode;
            if (mode === 'day') {
                var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

                for (var i = 0; i < $scope.events.length; i++) {
                    var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

                    if (dayToCheck === currentDay) {
                        return $scope.events[i].status;
                    }
                }
            }

            return '';
        }

        $scope.ObterPlanilha = function (d) {
            $loading.start('load');
            ManualService.GetH02(d).then(function (data) {
                $scope.listH02 = data.data;
                $scope.totalRecords = data.totalRecords;
                $loading.finish('load');
            })
        }

        $scope.ObterPlanilha($scope.obj);

        $scope.pageChanged = function () {
            $scope.obj.pageNumber = $scope.currentPage;
            $scope.ObterPlanilha($scope.obj);
        }

        $scope.editar = function (obj) {
            $uibModal.open({
                scope: $scope,
                templateUrl: 'views/modal/Manual/editar_manuais.html',
                controller: function ($scope, $uibModalInstance, manualSelected) {

                    $scope.creditos = ["Creditável", "Não Creditável"];
                    $scope.tiposCredito = ["01 - Imobilizado", "02 - Bens", "03 - Serviços", "06 - aluguel", "08 - aluguel", "01 - imobilizado importação", "02 - bens importação"];
                    $scope.obj = {};
                    $scope.obj.Creditos = manualSelected.creditos;
                    manualSelected.tipoItem = $scope.obj.TipoItem ?? '';

                    $scope.alterar = function () {
                        manualSelected.creditos = $scope.obj.Creditos
                        manualSelected.tipoItem = $scope.obj.TipoItem

                        ManualService.EditH02(manualSelected).then(function (response) {
                            if (response.success) {
                                $uibModalInstance.dismiss('dimiss');
                                SweetAlert.swal({
                                    title: "Sucesso!",
                                    type: "success",
                                    text: response.message
                                });
                            } else {
                                $uibModalInstance.dismiss('dimiss');
                                SweetAlert.swal({
                                    title: "ERRO!",
                                    type: "error",
                                    text: response.message
                                });
                            }
                        }, function (error) {
                            angular.forEach(error.data, function (value, index) {
                                if (index == 'errors') {
                                    $uibModalInstance.dismiss('dimiss');
                                    SweetAlert.swal({
                                        title: "ERRO!",
                                        type: "error",
                                        text: "Erro ao fazer o ajuste manual."
                                    });

                                    console.log("Erro ao fazer o ajuste manual: " + JSON.stringify(error.data[index]));
                                }
                            });
                        });

                    }

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                windowClass: "animated fadeIn",
                resolve: {
                    manualSelected: function () {
                        return obj;
                    }
                }
            });
        }

        $scope.dtOptions = DTOptionsBuilder.newOptions()
            .withDOM('<"html5buttons"B>lTfgitp')
            .withButtons([
                { extend: 'copy' },
                { extend: 'csv' },
                { extend: 'excel', title: 'Resumo_Creditos_' + $scope.dtProcessamento },

                {
                    extend: 'print',
                    customize: function (win) {
                        $(win.document.body).addClass('white-bg');
                        $(win.document.body).css('font-size', '10px');

                        $(win.document.body).find('table')
                            .addClass('compact')
                            .css('font-size', 'inherit');
                    }
                }
            ]);

        $scope.limparFiltro = function () {
            $scope.obj.filtroManual.MesCompetencia = new Date();
            $scope.obj.filtroManual.Credito = ""
            $scope.obj.filtroManual.TipoItem = ""
            $scope.GetAll($scope.obj);
        }
        $scope.filtrar = function () {

            $scope.ObterPlanilha($scope.obj);
        }
    })
    .controller('ManualH03Ctrl', function ($scope, $uibModal, SweetAlert, DTOptionsBuilder, ManualService, $q, $http, $loading) {
        $scope.obj = { pageNumber: 1, pageSize: 10, "filtroManual": { MesCompetencia: new Date(), Credito: "", TipoItem: "" } }
        $scope.maxSize = 10;
        $scope.currentPage = 1;
        $scope.numPerPage = $scope.obj.pageSize;
        $scope.totalRecords = 0;

        $scope.creditos = ["Creditável", "Não Creditável"];
        $scope.tiposCredito = ["01 - Imobilizado", "02 - Bens", "03 - Serviços", "06 - aluguel", "08 - aluguel", "01 - imobilizado importação", "02 - bens importação"];

        $scope.dateOptions = {
            formatYear: 'yy',
            maxDate: new Date(),
            minDate: new Date(),
            startingDay: 1
        };

        $scope.inlineOptions = {
            customClass: getDayClass,
            minDate: new Date(),
            showWeeks: true
        };

        $scope.format = 'MM/yyyy'

        $scope.toggleMin = function () {
            $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
            $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
            $scope.dateOptions.datepickerMode = "month";
            $scope.dateOptions.minMode = "month";
        };

        $scope.toggleMin();

        $scope.open1 = function () {
            $scope.popup1.opened = true;
        };

        $scope.popup1 = {
            opened: false
        };

        function getDayClass(data) {
            var date = data.date,
                mode = data.mode;
            if (mode === 'day') {
                var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

                for (var i = 0; i < $scope.events.length; i++) {
                    var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

                    if (dayToCheck === currentDay) {
                        return $scope.events[i].status;
                    }
                }
            }

            return '';
        }

        $scope.ObterPlanilha = function (d) {
            $loading.start('load');
            ManualService.GetH03(d).then(function (data) {
                $scope.listH03 = data.data;
                $scope.totalRecords = data.totalRecords;
                $loading.finish('load');
            })
        }

        $scope.ObterPlanilha($scope.obj);

        $scope.pageChanged = function () {
            $scope.obj.pageNumber = $scope.currentPage;
            $scope.ObterPlanilha($scope.obj);
        }

        $scope.editar = function (obj) {
            $uibModal.open({
                scope: $scope,
                templateUrl: 'views/modal/Manual/editar_manuais.html',
                controller: function ($scope, $uibModalInstance, manualSelected) {

                    $scope.creditos = ["Creditável", "Não Creditável"];
                    $scope.tiposCredito = ["01 - Imobilizado", "02 - Bens", "03 - Serviços", "06 - aluguel", "08 - aluguel", "01 - imobilizado importação", "02 - bens importação"];
                    $scope.obj = {};
                    $scope.obj.Creditos = manualSelected.creditos;
                    manualSelected.tipoItem = $scope.obj.TipoItem ?? '';

                    $scope.alterar = function () {
                        manualSelected.creditos = $scope.obj.Creditos
                        manualSelected.tipoItem = $scope.obj.TipoItem

                        ManualService.EditH03(manualSelected).then(function (response) {
                            if (response.success) {
                                $uibModalInstance.dismiss('dimiss');
                                SweetAlert.swal({
                                    title: "Sucesso!",
                                    type: "success",
                                    text: response.message
                                });
                            } else {
                                $uibModalInstance.dismiss('dimiss');
                                SweetAlert.swal({
                                    title: "ERRO!",
                                    type: "error",
                                    text: response.message
                                });
                            }
                        }, function (error) {
                            angular.forEach(error.data, function (value, index) {
                                if (index == 'errors') {
                                    $uibModalInstance.dismiss('dimiss');
                                    SweetAlert.swal({
                                        title: "ERRO!",
                                        type: "error",
                                        text: "Erro ao fazer o ajuste manual."
                                    });

                                    console.log("Erro ao fazer o ajuste manual: " + JSON.stringify(error.data[index]));
                                }
                            });
                        });

                    }

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                windowClass: "animated fadeIn",
                resolve: {
                    manualSelected: function () {
                        return obj;
                    }
                }
            });
        }

        $scope.dtOptions = DTOptionsBuilder.newOptions()
            .withDOM('<"html5buttons"B>lTfgitp')
            .withButtons([
                { extend: 'copy' },
                { extend: 'csv' },
                { extend: 'excel', title: 'Resumo_Creditos_' + $scope.dtProcessamento },

                {
                    extend: 'print',
                    customize: function (win) {
                        $(win.document.body).addClass('white-bg');
                        $(win.document.body).css('font-size', '10px');

                        $(win.document.body).find('table')
                            .addClass('compact')
                            .css('font-size', 'inherit');
                    }
                }
            ]);

        $scope.limparFiltro = function () {
            $scope.obj.filtroManual.MesCompetencia = new Date();
            $scope.obj.filtroManual.Credito = ""
            $scope.obj.filtroManual.TipoItem = ""
            $scope.GetAll($scope.obj);
        }
        $scope.filtrar = function () {

            $scope.ObterPlanilha($scope.obj);
        }
    })
    .controller('ManualH04Ctrl', function ($scope, $uibModal, SweetAlert, DTOptionsBuilder, ManualService, $q, $http, $loading) {
        $scope.obj = { pageNumber: 1, pageSize: 10, "filtroManual": { MesCompetencia: new Date(), Credito: "", TipoItem: "" } }
        $scope.maxSize = 10;
        $scope.currentPage = 1;
        $scope.numPerPage = $scope.obj.pageSize;
        $scope.totalRecords = 0;

        $scope.creditos = ["Creditável", "Não Creditável"];
        $scope.tiposCredito = ["01 - Imobilizado", "02 - Bens", "03 - Serviços", "06 - aluguel", "08 - aluguel", "01 - imobilizado importação", "02 - bens importação"];

        $scope.dateOptions = {
            formatYear: 'yy',
            maxDate: new Date(),
            minDate: new Date(),
            startingDay: 1
        };

        $scope.inlineOptions = {
            customClass: getDayClass,
            minDate: new Date(),
            showWeeks: true
        };

        $scope.format = 'MM/yyyy'

        $scope.toggleMin = function () {
            $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
            $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
            $scope.dateOptions.datepickerMode = "month";
            $scope.dateOptions.minMode = "month";
        };

        $scope.toggleMin();

        $scope.open1 = function () {
            $scope.popup1.opened = true;
        };

        $scope.popup1 = {
            opened: false
        };

        function getDayClass(data) {
            var date = data.date,
                mode = data.mode;
            if (mode === 'day') {
                var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

                for (var i = 0; i < $scope.events.length; i++) {
                    var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

                    if (dayToCheck === currentDay) {
                        return $scope.events[i].status;
                    }
                }
            }

            return '';
        }

        $scope.ObterPlanilha = function (d) {
            $loading.start('load');
            ManualService.GetH04(d).then(function (data) {
                $scope.listH04 = data.data;
                $scope.totalRecords = data.totalRecords;
                $loading.finish('load');
            })
        }

        $scope.ObterPlanilha($scope.obj);

        $scope.pageChanged = function () {
            $scope.obj.pageNumber = $scope.currentPage;
            $scope.ObterPlanilha($scope.obj);
        }

        $scope.editar = function (obj) {
            $uibModal.open({
                scope: $scope,
                templateUrl: 'views/modal/Manual/editar_manuais.html',
                controller: function ($scope, $uibModalInstance, manualSelected) {

                    $scope.creditos = ["Creditável", "Não Creditável"];
                    $scope.tiposCredito = ["01 - Imobilizado", "02 - Bens", "03 - Serviços", "06 - aluguel", "08 - aluguel", "01 - imobilizado importação", "02 - bens importação"];
                    $scope.obj = {};
                    $scope.obj.Creditos = manualSelected.creditos;
                    manualSelected.tipoItem = $scope.obj.TipoItem ?? '';

                    $scope.alterar = function () {
                        manualSelected.creditos = $scope.obj.Creditos
                        manualSelected.tipoItem = $scope.obj.TipoItem

                        ManualService.EditH04(manualSelected).then(function (response) {
                            if (response.success) {
                                $uibModalInstance.dismiss('dimiss');
                                SweetAlert.swal({
                                    title: "Sucesso!",
                                    type: "success",
                                    text: response.message
                                });
                            } else {
                                $uibModalInstance.dismiss('dimiss');
                                SweetAlert.swal({
                                    title: "ERRO!",
                                    type: "error",
                                    text: response.message
                                });
                            }
                        }, function (error) {
                            angular.forEach(error.data, function (value, index) {
                                if (index == 'errors') {
                                    $uibModalInstance.dismiss('dimiss');
                                    SweetAlert.swal({
                                        title: "ERRO!",
                                        type: "error",
                                        text: "Erro ao fazer o ajuste manual."
                                    });

                                    console.log("Erro ao fazer o ajuste manual: " + JSON.stringify(error.data[index]));
                                }
                            });
                        });

                    }

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                windowClass: "animated fadeIn",
                resolve: {
                    manualSelected: function () {
                        return obj;
                    }
                }
            });
        }

        $scope.dtOptions = DTOptionsBuilder.newOptions()
            .withDOM('<"html5buttons"B>lTfgitp')
            .withButtons([
                { extend: 'copy' },
                { extend: 'csv' },
                { extend: 'excel', title: 'Resumo_Creditos_' + $scope.dtProcessamento },

                {
                    extend: 'print',
                    customize: function (win) {
                        $(win.document.body).addClass('white-bg');
                        $(win.document.body).css('font-size', '10px');

                        $(win.document.body).find('table')
                            .addClass('compact')
                            .css('font-size', 'inherit');
                    }
                }
            ]);

        $scope.limparFiltro = function () {
            $scope.obj.filtroManual.MesCompetencia = new Date();
            $scope.obj.filtroManual.Credito = ""
            $scope.obj.filtroManual.TipoItem = ""
            $scope.GetAll($scope.obj);
        }
        $scope.filtrar = function () {

            $scope.ObterPlanilha($scope.obj);
        }
    })
    .controller('ManualH05Ctrl', function ($scope, $uibModal, SweetAlert, DTOptionsBuilder, ManualService, $q, $http, $loading) {
        $scope.obj = { pageNumber: 1, pageSize: 10, "filtroManual": { MesCompetencia: new Date(), Credito: "", TipoItem: "" } }
        $scope.maxSize = 10;
        $scope.currentPage = 1;
        $scope.numPerPage = $scope.obj.pageSize;
        $scope.totalRecords = 0;

        $scope.creditos = ["Creditável", "Não Creditável"];
        $scope.tiposCredito = ["01 - Imobilizado", "02 - Bens", "03 - Serviços", "06 - aluguel", "08 - aluguel", "01 - imobilizado importação", "02 - bens importação"];

        $scope.dateOptions = {
            formatYear: 'yy',
            maxDate: new Date(),
            minDate: new Date(),
            startingDay: 1
        };

        $scope.inlineOptions = {
            customClass: getDayClass,
            minDate: new Date(),
            showWeeks: true
        };

        $scope.format = 'MM/yyyy'

        $scope.toggleMin = function () {
            $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
            $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
            $scope.dateOptions.datepickerMode = "month";
            $scope.dateOptions.minMode = "month";
        };

        $scope.toggleMin();

        $scope.open1 = function () {
            $scope.popup1.opened = true;
        };

        $scope.popup1 = {
            opened: false
        };

        function getDayClass(data) {
            var date = data.date,
                mode = data.mode;
            if (mode === 'day') {
                var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

                for (var i = 0; i < $scope.events.length; i++) {
                    var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

                    if (dayToCheck === currentDay) {
                        return $scope.events[i].status;
                    }
                }
            }

            return '';
        }

        $scope.ObterPlanilha = function (d) {
            $loading.start('load');
            ManualService.GetH05(d).then(function (data) {
                $scope.listH05 = data.data;
                $scope.totalRecords = data.totalRecords;
                $loading.finish('load');
            })
        }

        $scope.ObterPlanilha($scope.obj);

        $scope.pageChanged = function () {
            $scope.obj.pageNumber = $scope.currentPage;
            $scope.ObterPlanilha($scope.obj);
        }

        $scope.editar = function (obj) {
            $uibModal.open({
                scope: $scope,
                templateUrl: 'views/modal/Manual/editar_manuais.html',
                controller: function ($scope, $uibModalInstance, manualSelected) {

                    $scope.creditos = ["Creditável", "Não Creditável"];
                    $scope.tiposCredito = ["01 - Imobilizado", "02 - Bens", "03 - Serviços", "06 - aluguel", "08 - aluguel", "01 - imobilizado importação", "02 - bens importação"];
                    $scope.obj = {};
                    $scope.obj.Creditos = manualSelected.creditos;
                    $scope.obj.TipoItem = manualSelected.tipoItem

                    $scope.alterar = function () {
                        manualSelected.creditos = $scope.obj.Creditos
                        manualSelected.tipoItem = $scope.obj.TipoItem ?? '';

                        ManualService.EditH05(manualSelected).then(function (response) {
                            if (response.success) {
                                $uibModalInstance.dismiss('dimiss');
                                SweetAlert.swal({
                                    title: "Sucesso!",
                                    type: "success",
                                    text: response.message
                                });
                            } else {
                                $uibModalInstance.dismiss('dimiss');
                                SweetAlert.swal({
                                    title: "ERRO!",
                                    type: "error",
                                    text: response.message
                                });
                            }
                        }, function (error) {
                            angular.forEach(error.data, function (value, index) {
                                if (index == 'errors') {
                                    $uibModalInstance.dismiss('dimiss');
                                    SweetAlert.swal({
                                        title: "ERRO!",
                                        type: "error",
                                        text: "Erro ao fazer o ajuste manual."
                                    });

                                    console.log("Erro ao fazer o ajuste manual: " + JSON.stringify(error.data[index]));
                                }
                            });
                        });

                    }

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                windowClass: "animated fadeIn",
                resolve: {
                    manualSelected: function () {
                        return obj;
                    }
                }
            });
        }

        $scope.dtOptions = DTOptionsBuilder.newOptions()
            .withDOM('<"html5buttons"B>lTfgitp')
            .withButtons([
                { extend: 'copy' },
                { extend: 'csv' },
                { extend: 'excel', title: 'Resumo_Creditos_' + $scope.dtProcessamento },

                {
                    extend: 'print',
                    customize: function (win) {
                        $(win.document.body).addClass('white-bg');
                        $(win.document.body).css('font-size', '10px');

                        $(win.document.body).find('table')
                            .addClass('compact')
                            .css('font-size', 'inherit');
                    }
                }
            ]);

        $scope.limparFiltro = function () {
            $scope.obj.filtroManual.MesCompetencia = new Date();
            $scope.obj.filtroManual.Credito = ""
            $scope.obj.filtroManual.TipoItem = ""
            $scope.GetAll($scope.obj);
        }
        $scope.filtrar = function () {

            $scope.ObterPlanilha($scope.obj);
        }
    })
    .controller('UsuariosCtrl', function ($scope, $uibModal, SweetAlert, DTOptionsBuilder, UsuarioService, $q, $http, $loading, $timeout) {

        $loading.start('load');
        var listUsers = UsuarioService.GetUsers();

        $q.all([listUsers]).then(function (response) {
            $scope.GetUsuarios = response[0].data;
            $loading.finish('load');
        });


        $scope.editar = function (data) {
            $uibModal.open({
                scope: $scope,
                templateUrl: 'views/modal/Usuario/editar_usuarios.html',
                controller: function ($scope, $uibModalInstance, usuarioSelected, $timeout) {

                    $scope.obj = {};
                    $scope.obj.cpfCnpj = usuarioSelected.cpfCnpj;
                    $scope.obj.nome = usuarioSelected.nome;
                    $scope.obj.email = usuarioSelected.email;
                    $scope.obj.status = usuarioSelected.status == 'Ativo' ? true : false;
                    $scope.alterar = function () {

                        usuarioSelected = $scope.obj;
                        usuarioSelected.status = $scope.obj.status.toString();
                        console.log("usuario: " + JSON.stringify(usuarioSelected));

                        UsuarioService.EditUser(usuarioSelected).then(function (response) {

                            if (response.success) {
                                $uibModalInstance.dismiss('dimiss');
                                SweetAlert.swal({
                                    title: "Sucesso!",
                                    text: response.message,
                                    type: "success"
                                });


                                $timeout(function () {
                                    window.location.reload();
                                }, 2000);
                            } else {
                                $uibModalInstance.dismiss('dimiss');
                                SweetAlert.swal({
                                    title: "Erro!",
                                    text: response.message,
                                    type: "error"
                                });
                            }
                        }, function (error) {

                        });
                    }

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                windowClass: "animated fadeIn",
                resolve: {
                    usuarioSelected: function () {
                        return data;
                    }
                }
            });
        }

        $scope.addUsuario = function (obj) {
            $uibModal.open({
                scope: $scope,
                templateUrl: 'views/modal/Usuario/editar_usuarios.html',
                controller: function ($scope, $uibModalInstance) {

                    $scope.usuario = obj;
                    $scope.alterar = function () {

                        UsuarioService.CreateUser(obj).then(function () {
                            $uibModalInstance.dismiss('dimiss');
                            SweetAlert.swal({
                                title: "Sucesso!",
                                text: "Usuário alterado com sucesso!",
                                type: "success"
                            });
                        })

                    }

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                windowClass: "animated fadeIn",
                resolve: {
                    usuarioSelected: function () {
                        return obj;
                    }
                }
            });
        }

        $scope.dtOptions = DTOptionsBuilder.newOptions()
            .withDOM('<"html5buttons"B>lTfgitp')
            .withButtons([
                { extend: 'copy' },
                { extend: 'csv' },
                { extend: 'excel', title: 'Resumo_Creditos_' + $scope.dtProcessamento },

                {
                    extend: 'print',
                    customize: function (win) {
                        $(win.document.body).addClass('white-bg');
                        $(win.document.body).css('font-size', '10px');

                        $(win.document.body).find('table')
                            .addClass('compact')
                            .css('font-size', 'inherit');
                    }
                }
            ]);

    })
    ;