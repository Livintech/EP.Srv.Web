angular.module('EP')
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

        $loading.finish('load');

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
                if ($scope.user.CpfCnpj != undefined) {
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
    .controller('ClienteCtrl', function ($scope, SweetAlert) {

        $scope.obj = {
            codigo: '',
            cpf: '',
            cnpj: '',
            nome: '',
            email: '',
            telefone: '',
            endereco: '',
            cep: '',
            bairro: '',
            cidade: '',
            uf: '',
            numero: '',
            complemento: '',
            dataInicio: '',
            tipo: ''
        }
        $scope.errorForm = "";
        $scope.erroCpf = false;
        $scope.erroCnpj = false;

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

        $scope.format = 'dd/MM/yyyy'

        $scope.toggleMin = function () {
            $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
            $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
            $scope.dateOptions.currentText = false;
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
        };

        $scope.change = function () {
            $scope.erroCnpj = false;
            $scope.erroCpf = false;
            $scope.errorForm = $scope.clienteForm?.$error;

            angular.forEach($scope.errorForm, function (value, index) {
                if (index == 'cnpj') {
                    $scope.erroCnpj = true;
                }
                if (index == 'cpf') {
                    $scope.erroCpf = true;
                }
            });
        };

        $scope.Incluir = function () {
            $scope.erroCnpj = false;
            $scope.erroCpf = false;
            $scope.errorForm = $scope.clienteForm?.$error;

            angular.forEach($scope.errorForm, function (value, index) {
                if (index == 'cnpj') {
                    $scope.erroCnpj = true;
                }
                if (index == 'cpf') {
                    $scope.erroCpf = true;
                }
            });

            if ($scope.erroCnpj || $scope.erroCpf) {
                SweetAlert.swal({
                    title: "Atenção!",
                    text: "Existem campos com erro de validação",
                    type: "warning"
                });
            } else if (($scope.obj.cpf == undefined || $scope.obj.cpf == '') &&
                ($scope.obj.cnpj == undefined || $scope.obj.cnpj == '')) {
                SweetAlert.swal({
                    title: "Atenção!",
                    text: "Para finalizar o cadastro é necessário preencher o CPF ou o CNPJ",
                    type: "warning"
                });
            } else {
                console.log(JSON.stringify($scope.obj));
            }
        };
    });