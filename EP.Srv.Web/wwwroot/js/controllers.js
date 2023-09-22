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
    .controller('DashboardCtrl', function ($scope, $loading, $q, SweetAlert) {

        $loading.start('load');

        // Filtros -------------------------------------------------------------------------------

        $scope.lstPeriodoAnual = [];
        $scope.selectedPeriodoAno = "";
        $scope.selectedPeriodo = "";
        $scope.itemSelectType = "";
        $scope.tab = 1;

        $loading.finish('load');

    })
    .controller('LoginCtrl', function ($scope, toaster, AuthService, ClienteService, $loading, $localStorage, $timeout) {
        $scope.OnInit = function () {
            $scope.tipo = "PF";
            $localStorage.$reset();
        };

        $scope.RedirecionaInicio = function () {
            $timeout(function () {
                window.location = "#/inicio/blank";
            }, 2000);
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

                AuthService.logar(user).then(function (response) {
                    if (response.data.authenticated) {
                        $loading.finish('load');

                        toaster.pop({
                            type: 'success',
                            title: 'Sucesso',
                            body: response.data.message,
                            showCloseButton: true,
                            timeout: 5000
                        });

                        $localStorage.$reset();
                        $localStorage.user = response.data;

                        if (response.data.perfil != 'Master') {

                            ClienteService.ObterEmpresas().then(function (resp) {
                                if (resp.success) {

                                    angular.forEach(resp.data.$values, function (value, index) {
                                        if (value.codigo == response.data.codigoEmpresa.substr(0, 5)) {
                                            $localStorage.user.filtroEmpresa = value;
                                        };
                                    });

                                    $scope.RedirecionaInicio();

                                } else {
                                    toaster.pop({
                                        type: 'error',
                                        title: 'Error',
                                        body: "Erro ao obter os dados da empresa: " + response.data.codigoEmpresa,
                                        showCloseButton: true,
                                        timeout: 5000
                                    });

                                    console.log("Mensagem erro: " + response.data.message);
                                    console.log("Erro ao obter os dados da empresa: " + response.data.codigoEmpresa);
                                }
                            })
                        } else {
                            $scope.RedirecionaInicio();
                        }


                    } else {
                        $localStorage.user = response.data;
                        $loading.finish('load');

                        toaster.pop({
                            type: 'error',
                            title: 'Error',
                            body: response.data.message,
                            showCloseButton: true,
                            timeout: 5000
                        });

                        $timeout(function () {
                            $loading.finish('load');
                        }, 2000);
                    }
                }, function (error) {
                    $loading.finish('load');

                    toaster.pop({
                        type: 'error',
                        title: 'Erro ao logar',
                        body: 'Ocorreu um erro inesperado no login. \nEntre em contato com o administrador/suporte.',
                        showCloseButton: true,
                        timeout: 5000
                    });

                    console.log("Log --> " + JSON.stringify(error.data));
                });
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
    .controller('topNavCtrl', function ($scope, $rootScope, $localStorage, $uibModal, SweetAlert, ClienteService) {

        var filtroEmpresa = $localStorage.user.filtroEmpresa;
        var perfil = $localStorage.user.perfil;

        $scope.user = {
            nome: $localStorage.user.userName.split('-')[1] + " - " + perfil,
            perfil: perfil
        };
        $scope.labelFiltro = (filtroEmpresa == '' || filtroEmpresa == undefined) ? 'Filtro Empresa' : ("00000" + filtroEmpresa.id).slice(-5) + ' - ' + filtroEmpresa.nomeRazao;
        $scope.empresas = [];

        ClienteService.ObterEmpresas().then(function (response) {
            angular.forEach(response.data, function (values, index) {
                if (index == "$values") {
                    $scope.empresas = values;
                }
            });
        });


        $scope.logout = function () {
            $localStorage.$reset();
            $rootScope.user = undefined;
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

        $scope.selectEntity = function (data) {
            $localStorage.user.filtroEmpresa = data;
            $scope.labelFiltro = ("00000" + data.id).slice(-5) + ' - ' + data.nomeRazao;
            window.location.reload();
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
                { extend: 'csv', title: 'Resumo_' + $scope.dtProcessamento },
                { extend: 'excel', title: 'Resumo_' + $scope.dtProcessamento },

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
    .controller('UsuariosCtrl', function ($scope, $uibModal, SweetAlert, DTOptionsBuilder, UsuarioService, $localStorage, $loading, $timeout) {

        $loading.start('load');
        $scope.erroSenha = false;
        $scope.codigoEmpresaEnabled = true;
        $scope.objUser = {
            codigoEmpresa: '',
            cpfCnpj: '',
            nome: '',
            perfil: '',
            email: '',
            senha: '',
            senhaConfirmacao: ''
        }

        UsuarioService.GetUsers().then(function (response) {
            $scope.GetUsuarios = response.data;
            $loading.finish('load');
        });

        $scope.editar = function (data) {
            $uibModal.open({
                scope: $scope,
                backdrop: false,
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

        $scope.addUsuario = function (tipo) {
            $uibModal.open({
                scope: $scope,
                backdrop: false,
                templateUrl: 'views/modal/Usuario/incluir_usuarios.html',
                controller: function ($scope, $uibModalInstance, $loading, SweetAlert, UsuarioService) {

                    var tipoEmpresa = $localStorage.user.filtroEmpresa?.tipo;
                    var codigoEmpresa = $localStorage.user.filtroEmpresa?.codigo;

                    if (tipoEmpresa == '' || tipoEmpresa == undefined) {
                        SweetAlert.swal({
                            title: "Erro!",
                            text: "Empresa não encontrada. Selecione uma empresa válida",
                            type: "error"
                        });

                        return;
                    }

                    $scope.objUser.codigoEmpresa = codigoEmpresa + "." + tipoEmpresa;

                    $scope.Add = function () {

                        if ($scope.objUser.senha != $scope.objUser.senhaConfirmacao) {
                            $scope.erroSenha = true;
                            return;
                        } else {
                            $scope.erroSenha = false;
                        }

                        $loading.start('load');

                        UsuarioService.cadastrar($scope.objUser).then(function (respData) {
                            $loading.finish('load');

                            if (respData.data.success) {
                                SweetAlert.swal({
                                    title: "Sucesso!",
                                    text: "Usuário cadastrado com sucesso",
                                    type: "success"
                                }, function (isConfirm) {
                                    if (isConfirm) {
                                        $uibModalInstance.dismiss('dimiss');
                                        window.location.reload();
                                    } else {
                                        $uibModalInstance.dismiss('dimiss');
                                        window.location.reload();
                                    }
                                });
                            } else {
                                SweetAlert.swal({
                                    title: "Erro!",
                                    text: "Erro cadastrar usuário. \n" + respData.data.message + "",
                                    type: "error"
                                });
                            }
                        }, function (error) {
                            angular.forEach(error.data, function (value, index) {
                                SweetAlert.swal({
                                    title: "Erro!",
                                    text: "Erro cadastrar usuário. \n" + value.errorMessage + "",
                                    type: "error"
                                });
                            });

                        });
                        //})

                    }

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                windowClass: "animated fadeIn"
            });
        }

        $scope.dtOptions = DTOptionsBuilder.newOptions()
            .withDOM('<"html5buttons"B>lTfgitp')
            .withButtons([
                { extend: 'copy' },
                { extend: 'csv' },
                { extend: 'excel', title: 'Usuarios_' + Date.now },

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
    .controller('ClienteCtrl', function ($scope, SweetAlert, ClienteService, $uibModal, $localStorage, $loading) {

        $scope.obj = {
            codigoEmpresa: '',
            cpf: '',
            cnpj: '',
            email: '',
            telefone: '',
            endereco: '',
            cep: '',
            bairro: '',
            cidade: '',
            uf: '',
            numero: '',
            complemento: '',
            dataSituacao: '',
            tipo: ''
        }
        $scope.errorForm = "";
        $scope.erroCpf = false;
        $scope.erroCnpj = false;
        $scope.erroEmail = false;
        $scope.perfil = $localStorage.user.perfil;

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
            $scope.erroEmail = false;
            $scope.errorForm = $scope.clienteForm?.$error;

            angular.forEach($scope.errorForm, function (value, index) {
                if (index == 'cnpj') {
                    $scope.erroCnpj = true;
                }
                if (index == 'cpf') {
                    $scope.erroCpf = true;
                }
                if (index == 'email') {
                    $scope.erroEmail = true;
                }
            });
        };

        $scope.Incluir = function () {
            $loading.start('load');

            $scope.erroCnpj = false;
            $scope.erroCpf = false;
            $scope.erroSenha = false;
            $scope.errorForm = $scope.clienteForm?.$error;
            $scope.codigoEmpresaEnabled = false;

            angular.forEach($scope.errorForm, function (value, index) {
                if (index == 'cnpj') {
                    $scope.erroCnpj = true;
                }
                if (index == 'cpf') {
                    $scope.erroCpf = true;
                }
                if (index == 'email') {
                    $scope.erroEmail = true;
                }
            });

            if ($scope.erroCnpj || $scope.erroCpf || $scope.erroEmail) {
                $loading.finish('load');

                SweetAlert.swal({
                    title: "Atenção!",
                    text: "Existem campos com erro de validação",
                    type: "warning"
                });
            } else if (($scope.obj.cpf == undefined || $scope.obj.cpf == '') &&
                ($scope.obj.cnpj == undefined || $scope.obj.cnpj == '')) {
                $loading.finish('load');

                SweetAlert.swal({
                    title: "Atenção!",
                    text: "Para finalizar o cadastro é necessário preencher o CPF ou o CNPJ",
                    type: "warning"
                });
            } else {
                console.log(JSON.stringify($scope.obj));
                ClienteService.CadastrarCliente($scope.obj)
                    .then(function (response) {
                        $loading.finish('load');
                        var data = response;

                        if (data.success) {
                            if (data.data.tipo == "EMP") {
                                $scope.objUser = {};
                                SweetAlert.swal({
                                    title: "Sucesso!",
                                    text: "Cadastro finalizado com sucesso. Agora você precisa criar um usuário associado a esta empresa. \nVamos lá?",
                                    type: "success"
                                },
                                    function (isConfirm) {
                                        if (isConfirm) {
                                            // abrir modal de cadstro de usuário
                                            $uibModal.open({
                                                scope: $scope,
                                                backdrop: false,
                                                templateUrl: 'views/modal/usuario/incluir_usuarios.html',
                                                controller: function ($scope, $uibModalInstance, $loading, SweetAlert, UsuarioService) {

                                                    $scope.objUser.codigoEmpresa = '';
                                                    $scope.objUser.codigoEmpresa = ("00000" + data.data.id).slice(-5);

                                                    $scope.Add = function () {

                                                        if ($scope.objUser.senha != $scope.objUser.senhaConfirmacao) {
                                                            $scope.erroSenha = true;
                                                            return;
                                                        }

                                                        $loading.start('load');
                                                        //$scope.objUser.codigoEmpresa += "." + data.data.tipo;

                                                        UsuarioService.cadastrar($scope.objUser).then(function (respData) {
                                                            $loading.finish('load');

                                                            if (respData.data.success) {
                                                                SweetAlert.swal({
                                                                    title: "Sucesso!",
                                                                    text: "Usuário cadastrado com sucesso",
                                                                    type: "success"
                                                                }, function (isConfirm) {
                                                                    if (isConfirm) {
                                                                        $uibModalInstance.dismiss('dimiss');
                                                                        window.location.reload();
                                                                    } else {
                                                                        $uibModalInstance.dismiss('dimiss');
                                                                        window.location.reload();
                                                                    }
                                                                });
                                                            } else {
                                                                SweetAlert.swal({
                                                                    title: "Erro!",
                                                                    text: "Erro cadastrar usuário. \n" + respData.data.message + "",
                                                                    type: "error"
                                                                });
                                                            }
                                                        }, function (error) {
                                                            angular.forEach(error.data, function (value, index) {
                                                                SweetAlert.swal({
                                                                    title: "Erro!",
                                                                    text: "Erro cadastrar usuário. \n" + value.errorMessage + "",
                                                                    type: "error"
                                                                });
                                                            });

                                                        });
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
                                            }).result.then(function (result) {
                                                /*$scope.GetAll();*/
                                            });
                                        }
                                    });

                            } else {
                                SweetAlert.swal({
                                    title: "Sucesso!",
                                    text: "Cadastro finalizado com sucesso.",
                                    type: "success"
                                },
                                    function (isConfirm) {
                                        if (isConfirm) {
                                            window.location.reload();
                                        }
                                    });
                            }
                        } else {
                            weetAlert.swal({
                                title: "Erro!",
                                text: "Erro ao solicitar sua equisição, entre em contato com o suporte para mais informações.",
                                type: "error"
                            });
                        }
                    }, function (error) {
                        $loading.finish('load');

                        console.log("Erro: " + error);
                        SweetAlert.swal({
                            title: "Erro!",
                            text: "Erro ao solicitar sua equisição, entre em contato com o suporte para mais informações.",
                            type: "error"
                        });
                    });
            }
        };

        $scope.change = function () {
            if ($scope.obj.tipo != "EMP") {
                var codigoEmp = $localStorage.user.filtroEmpresa.id
                $scope.obj.codigoEmpresa = ("00000" + codigoEmp).slice(-5);
            } else {
                $scope.obj.codigoEmpresa = "";
            }
        };
    })
    .controller('ListaClientesCtrl', function ($scope, ClienteService, $localStorage, $loading, DTOptionsBuilder) {

        $loading.start('load');
        var obj = {
            codigoEmpresa: $localStorage.user.filtroEmpresa == undefined ? '' : ("00000" + $localStorage.user.filtroEmpresa.id).slice(-5)
        };

        ClienteService.ObterCLientes(obj).then(function (response) {
            var objResponse = response;
            if (objResponse.success) {
                $scope.lstClientes = objResponse.data.$values;
                angular.forEach($scope.lstClientes, function (values, index) {
                    if (values.tipo == 'EMP') {
                        values.tipo = 'Empresa';
                    } else if (values.tipo == 'CLI') {
                        values.tipo = 'Cliente';
                    } else if (values.tipo == 'FOR') {
                        values.tipo = 'Fornecedor';
                    } else if (values.tipo == 'PRES') {
                        values.tipo = 'Prestador de serviços';
                    } else {
                        values.tipo = 'Funcionário';
                    }

                    var strNome = values.nomeRazao.substring(0, 30);
                    values.nomeRazao = strNome.length >= 20 ? strNome + '..' : strNome;
                    values.telefone = formatarTel(values.telefone);
                    values.cnpj = formatarCNPJ(values.cnpj);
                    values.cpf = formatarCPF(values.cpf);
                });
            }
            $loading.finish('load');
        });

        function formatarTel(tel) {
            if (tel) {
                const value = tel.toString().replace(/\D/g, '');

                let foneFormatado = '';

                if (value.length > 12) {
                    foneFormatado = value.replace(/(\d{2})?(\d{2})?(\d{5})?(\d{4})/,
                        '+$1 ($2) $3-$4');

                } else if (value.length > 11) {
                    foneFormatado = value.replace(/(\d{2})?(\d{2})?(\d{4})?(\d{4})/,
                        '+$1 ($2) $3-$4');

                } else if (value.length > 10) {
                    foneFormatado = value.replace(/(\d{2})?(\d{5})?(\d{4})/, '($1) $2-$3');

                } else if (value.length > 9) {
                    foneFormatado = value.replace(/(\d{2})?(\d{4})?(\d{4})/, '($1) $2-$3');

                } else if (value.length > 5) {
                    foneFormatado = value.replace(/^(\d{2})?(\d{4})?(\d{0,4})/, '($1) $2-$3');

                } else if (value.length > 1) {
                    foneFormatado = value.replace(/^(\d{2})?(\d{0,5})/, '($1) $2');

                } else {
                    if (tel !== '') { foneFormatado = value.replace(/^(\d*)/, '($1'); }
                }

                return foneFormatado;
            }
        };

        function formatarCPF(cpf) {

            var ao_cpf = cpf;
            var cpfValido = /^(([0-9]{3}.[0-9]{3}.[0-9]{3}-[0-9]{2}))$/;
            if (cpfValido.test(ao_cpf) == false) {

                ao_cpf = ao_cpf.replace(/\D/g, ""); //Remove tudo o que não é dígito

                if (ao_cpf.length == 11) {
                    ao_cpf = ao_cpf.replace(/(\d{3})(\d)/, "$1.$2"); //Coloca um ponto entre o terceiro e o quarto dígitos
                    ao_cpf = ao_cpf.replace(/(\d{3})(\d)/, "$1.$2"); //Coloca um ponto entre o terceiro e o quarto dígitos
                    //de novo (para o segundo bloco de números)
                    ao_cpf = ao_cpf.replace(/(\d{3})(\d{1,2})$/, "$1-$2"); //Coloca um hífen entre o terceiro e o quarto dígitos
                }
            }

            return ao_cpf;
        }

        function formatarCNPJ(cnpj) {
            return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
        }

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
    })
    .controller('ProdutosServicosCtrl', function ($scope, SweetAlert, DTOptionsBuilder, $loading, ProdutosServicosService, $uibModal, $localStorage) {
        $scope.OnInit = function () {
            $scope.getProdutosServicos = [];
            $scope.obj = {
                empresaId: '',
                descricao: '',
                codigoEmpresa: ''
            };
            $scope.erroCampo = false;
            $scope.textoErro = '';

            $scope.filtroEmpresaSelecionado = true;

            if ($localStorage.user.filtroEmpresa != undefined) {
                $loading.start('load');

                //$scope.filtroEmpresaSelecionado = false;
                $scope.obj.empresaId = $localStorage.user.filtroEmpresa.id.toString();
                $scope.obj.codigoEmpresa = ("00000" + $localStorage.user.filtroEmpresa.id).slice(-5);

                ProdutosServicosService.ListarProdutosServicos($scope.obj)
                    .then(function (response) {
                        $loading.finish('load');

                        var data = response;
                        if (data.success) {
                            angular.forEach(data.data, function (value, index) {
                                if (index == '$values') {
                                    $scope.getProdutosServicos = value;
                                }
                            });
                        }
                    }, function (error) {
                        console.log("Erro " + JSON.stringify(error));
                    });
            }
        };

        $scope.limpar = function () {
            $scope.OnInit();
        };

        $scope.gravar = function () {
            $scope.erroCampo = false;
            $scope.textoErro = '';

            if ($scope.obj.descricao == '') {
                $scope.erroCampo = true;
                $scope.textoErro = '* Campo obrigatório';
                return;
            } else {
                $loading.start('load');
                $scope.erroCampo = false;
                $scope.textoErro = '';

                ProdutosServicosService.GravarDadosProdutos($scope.obj)
                    .then(function (response) {
                        $loading.finish('load');

                        if (response.success) {

                            SweetAlert.swal({
                                title: "Sucesso!",
                                text: response.message,
                                type: "success"
                            },
                                function (isConfirm) {
                                    if (isConfirm) {
                                        $scope.OnInit();
                                    }
                                });
                        } else {
                            SweetAlert.swal({
                                title: "Erro!",
                                text: response.message,
                                type: "error"
                            });
                        }
                    }, function (error) {
                        console.log("Erro " + JSON.stringify(error));
                    });
            }
        };

        $scope.OnInit();

        $scope.editar = function (data) {
            $uibModal.open({
                scope: $scope,
                backdrop: false,
                templateUrl: 'views/modal/ProdutoServico/editar_produto_servico.html',
                controller: function ($scope, $uibModalInstance, produtoServicoSelected, $timeout) {

                    $scope.objProduto = {};
                    $scope.objProduto.id = produtoServicoSelected.id;
                    $scope.objProduto.codigoEmpresa = produtoServicoSelected.codigoEmpresa;
                    $scope.objProduto.empresaId = produtoServicoSelected.empresaId.toString();
                    $scope.objProduto.descricao = produtoServicoSelected.descricao;
                    $scope.objProduto.ativo = produtoServicoSelected.ativo;

                    $scope.alterar = function () {
                        $loading.start('load');

                        ProdutosServicosService.AtualizaProdutoServico($scope.objProduto).then(function (response) {
                            $loading.finish('load');

                            if (response.success) {

                                $uibModalInstance.dismiss('dimiss');
                                SweetAlert.swal({
                                    title: "Sucesso!",
                                    text: response.message,
                                    type: "success"
                                },
                                    function (isConfirm) {
                                        if (isConfirm) {
                                            $scope.OnInit();
                                        }
                                    });
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
                    produtoServicoSelected: function () {
                        return data;
                    }
                }
            });
        }

        $scope.change = function (texto) {
            if (texto.length >= 3 && $localStorage.user.filtroEmpresa != undefined) {
                $scope.erroCampo = false;
                $scope.textoErro = '';
                $scope.filtroEmpresaSelecionado = false;
            } else {
                $scope.filtroEmpresaSelecionado = true;
            }
        }

        $scope.dtOptions = DTOptionsBuilder.newOptions()
            .withDOM('<"html5buttons"B>lTfgitp')
            .withButtons([
                { extend: 'copy' },
                { extend: 'csv' },
                { extend: 'excel', title: 'Usuarios_' + Date.now },

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

        //$(function () {
        //    $('[type="button"]').tooltip();
        //    $('[type="button"]').title = 'Teste ToolTip';
        //});
    })
    .controller('BancoCtrl', function ($scope, SweetAlert, DTOptionsBuilder, $loading, BancoService, $localStorage, $uibModal) {

        $loading.start('load');

        $scope.OnInit = function () {
            $scope.obj = {
                codigo: '',
                instituicao: '',
                agencia: '',
                conta: '',
                saldoInicial: '',
                dataSaldoInicio: '',
                empresaId: 0
            };

            $scope.erroCodigo = false;
            $scope.erroAgencia = false;
            $scope.erroConta = false;
            $scope.erroInstituicao = false;
            $scope.textoErro = '';

            $scope.filtroEmpresaSelecionado = true;
            var filtroEmpresa = $localStorage.user.filtroEmpresa;

            if (filtroEmpresa != undefined) {
                $scope.filtroEmpresaSelecionado = false;
            }

            var newObj = {
                empresaId: filtroEmpresa == undefined ? '' : filtroEmpresa.id.toString()
            };

            BancoService.ListarBancos(newObj).then(function (response) {
                $loading.finish('load');
                if (response.success) {
                    $scope.listaBancos = response.data.$values;
                }
            });
        };

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

        $scope.limpar = function () {
            $scope.OnInit();
        };

        $scope.gravar = function () {
            $scope.erroCodigo = false;
            $scope.erroAgencia = false;
            $scope.erroConta = false;
            $scope.erroInstituicao = false;
            $scope.textoErro = '';

            if ($localStorage.user.filtroEmpresa == undefined) {
                SweetAlert.swal({
                    title: "Erro!",
                    text: "Selecione uma empresa válida para continuar com o cadastro.",
                    type: "error"
                });

                return;
            }

            if ($scope.obj.codigo == '' || $scope.obj.codigo == undefined || $scope.obj.codigo == 0) {
                $scope.erroCodigo = true;
                $scope.textoErro = '* Código do banco é obrigatório';
                return;
            } else if ($scope.obj.instituicao == '' || $scope.obj.instituicao == undefined) {
                $scope.erroInstituicao = true;
                $scope.textoErro = '* Campo obrigatório';
                return;
            } else if ($scope.obj.agencia == '' || $scope.obj.agencia == undefined) {
                $scope.erroAgencia = true;
                $scope.textoErro = '* Campo agência é obrigatório ';
                return;
            } else if ($scope.obj.conta == 0 || $scope.obj.conta == undefined) {
                $scope.erroConta = true;
                $scope.textoErro = '* Campo conta é obrigatório';
                return;
            } else {
                $scope.erroCodigo = false;
                $scope.erroAgencia = false;
                $scope.erroConta = false;
                $scope.erroInstituicao = false;
                $scope.textoErro = '';
            }

            $scope.obj.empresaId = $localStorage.user.filtroEmpresa.id.toString();
            $loading.start('load');

            BancoService.GravarDadosBanco($scope.obj)
                .then(function (response) {
                    var data = response;
                    if (data.success) {
                        $loading.finish('load');
                        $scope.OnInit();
                        SweetAlert.swal({
                            title: "Sucesso!",
                            text: "Cadastro finalizado com sucesso.",
                            type: "success"
                        },
                            function (isConfirm) {
                                if (isConfirm) {
                                    window.location.reload();
                                }
                            });
                    } else {
                        $loading.finish('load');

                        SweetAlert.swal({
                            title: "Erro!",
                            text: "Não foi possível finalizar o cadastro. Entre em contato com o administrador do sistema.",
                            type: "error"
                        });
                    }
                }, function (error) {
                    $loading.finish('load');
                    console.log(error);

                    SweetAlert.swal({
                        title: "Erro!",
                        text: "Erro ao solicitar sua requisição, entre em contato com o suporte para mais informações.",
                        type: "error"
                    });
                });
        };

        $scope.editar = function (banco) {
            $uibModal.open({
                scope: $scope,
                backdrop: false,
                templateUrl: 'views/modal/Banco/editar_banco.html',
                controller: function ($scope, $uibModalInstance, bancoSelected) {

                    $scope.objBanco = {};
                    $scope.objBanco.instituicao = bancoSelected.instituicao;
                    $scope.objBanco.codigo = bancoSelected.codigo;
                    $scope.objBanco.saldoInicial = bancoSelected.saldoInicial;
                    $scope.objBanco.agencia = bancoSelected.agencia;
                    $scope.objBanco.conta = bancoSelected.conta;
                    $scope.objBanco.ativo = bancoSelected.ativo;
                    $scope.objBanco.id = bancoSelected.id;

                    $scope.alterar = function () {
                        $loading.start('load');

                        BancoService.AtualizarDadosBanco($scope.objBanco).then(function (response) {
                            $loading.finish('load');

                            if (response.success) {

                                $uibModalInstance.dismiss('dimiss');
                                SweetAlert.swal({
                                    title: "Sucesso!",
                                    text: response.message,
                                    type: "success"
                                },
                                    function (isConfirm) {
                                        if (isConfirm) {
                                            $scope.OnInit();
                                        }
                                    });
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
                    bancoSelected: function () {
                        return banco;
                    }
                }
            });
        }

        $scope.dtOptions = DTOptionsBuilder.newOptions()
            .withDOM('<"html5buttons"B>lTfgitp')
            .withButtons([
                { extend: 'copy' },
                { extend: 'csv' },
                { extend: 'excel', title: 'Usuarios_' + Date.now },
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

        $scope.OnInit();
    })
    .controller('FormaPagamentoCtrl', function ($scope, SweetAlert, DTOptionsBuilder, $loading, FormaPagamentoService, $localStorage, $uibModal) {
        $scope.dtOptions = DTOptionsBuilder.newOptions()
            .withDOM('<"html5buttons"B>lTfgitp')
            .withButtons([
                { extend: 'copy' },
                { extend: 'csv' },
                { extend: 'excel', title: 'Usuarios_' + Date.now },
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

        $loading.start('load');

        $scope.OnInit = function () {
            $scope.obj = {
                empresaId: '',
                descricao: '',
                codigoEmpresa: ''
            }

            $scope.erroCampo = false;
            $scope.textoErro = '';

            $scope.filtroEmpresaSelecionado = true;

            if ($localStorage.user.filtroEmpresa != undefined) {
                //$scope.filtroEmpresaSelecionado = false;
                $scope.obj.empresaId = $localStorage.user.filtroEmpresa.id.toString();
                $scope.obj.codigoEmpresa = ("00000" + $localStorage.user.filtroEmpresa.id).slice(-5);

                FormaPagamentoService.ObterListaPagamentos($scope.obj)
                    .then(function (response) {
                        $loading.finish('load');

                        var data = response;
                        if (data.success) {
                            angular.forEach(data.data, function (value, index) {
                                if (index == '$values') {
                                    $scope.listaPagamentos = value;
                                }
                            });
                        }
                    }, function (error) {
                        console.log("Erro " + JSON.stringify(error));
                    });
            } else {
                $loading.finish('load');
                //$('[data-toggle="tooltip"]').prop('title', 'Selecione Empresa');
            }
        };

        $scope.limpar = function () {
            $scope.OnInit();
        };

        $scope.gravar = function () {
            $scope.erroCampo = false;
            $scope.textoErro = '';

            if ($scope.obj.descricao == '') {
                $scope.erroCampo = true;
                $scope.textoErro = '* Campo obrigatório';
                return;
            } else {
                $loading.start('load');
                $scope.erroCampo = false;
                $scope.textoErro = '';

                FormaPagamentoService.GravarDadosPagamento($scope.obj)
                    .then(function (response) {
                        $loading.finish('load');

                        if (response.success) {

                            SweetAlert.swal({
                                title: "Sucesso!",
                                text: response.message,
                                type: "success"
                            },
                                function (isConfirm) {
                                    if (isConfirm) {
                                        $scope.OnInit();
                                    }
                                });
                        } else {
                            SweetAlert.swal({
                                title: "Erro!",
                                text: response.message,
                                type: "error"
                            });
                        }
                    }, function (error) {

                    });
            }
        };

        $scope.editar = function (data) {
            $uibModal.open({
                scope: $scope,
                backdrop: false,
                templateUrl: 'views/modal/Pagamento/editar_pagamento.html',
                controller: function ($scope, $uibModalInstance, pagamentoSelected, $timeout) {

                    $scope.objPagamento = {};
                    $scope.objPagamento.id = pagamentoSelected.id;
                    $scope.objPagamento.codigoEmpresa = pagamentoSelected.codigoEmpresa;
                    $scope.objPagamento.empresaId = pagamentoSelected.empresaId.toString();
                    $scope.objPagamento.descricao = pagamentoSelected.descricao;
                    $scope.objPagamento.ativo = pagamentoSelected.ativo;

                    $scope.alterar = function () {
                        $loading.start('load');

                        FormaPagamentoService.AtualizaPagamento($scope.objPagamento).then(function (response) {
                            $loading.finish('load');

                            if (response.success) {

                                $uibModalInstance.dismiss('dimiss');
                                SweetAlert.swal({
                                    title: "Sucesso!",
                                    text: response.message,
                                    type: "success"
                                },
                                    function (isConfirm) {
                                        if (isConfirm) {
                                            $scope.OnInit();
                                        }
                                    });
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
                    pagamentoSelected: function () {
                        return data;
                    }
                }
            });
        }

        $scope.change = function (texto) {
            if (texto.length >= 3 && $localStorage.user.filtroEmpresa != undefined) {
                $scope.erroCampo = false;
                $scope.textoErro = '';
                $scope.filtroEmpresaSelecionado = false;
            } else {
                $scope.filtroEmpresaSelecionado = true;
            }
        }

        $scope.OnInit();

        $(function () {
            $('[data-toggle="tooltip"]').tooltip();
        });
    })
    .controller('CentroCustoCtrl', function ($scope, SweetAlert, DTOptionsBuilder, $loading, CentroCustoService, $localStorage, $uibModal) {
        $scope.dtOptions = DTOptionsBuilder.newOptions()
            .withDOM('<"html5buttons"B>lTfgitp')
            .withButtons([
                { extend: 'copy' },
                { extend: 'csv' },
                { extend: 'excel', title: 'Usuarios_' + Date.now },
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


        $scope.OnInit = function () {
            $scope.obj = {
                empresaId: '',
                descricao: '',
                codigoEmpresa: ''
            }

            $scope.erroCampo = false;
            $scope.textoErro = '';

            $scope.filtroEmpresaSelecionado = true;

            if ($localStorage.user.filtroEmpresa != undefined) {
                $loading.start('load');

                //$scope.filtroEmpresaSelecionado = false;
                $scope.obj.empresaId = $localStorage.user.filtroEmpresa.id.toString();
                $scope.obj.codigoEmpresa = ("00000" + $localStorage.user.filtroEmpresa.id).slice(-5);

                CentroCustoService.ListarCentroCustos($scope.obj)
                    .then(function (response) {
                        $loading.finish('load');

                        var data = response;
                        if (data.success) {
                            angular.forEach(data.data, function (value, index) {
                                if (index == '$values') {
                                    $scope.listaCentroCustos = value;
                                }
                            });
                        }
                    }, function (error) {
                        console.log("Erro " + JSON.stringify(error));
                    });
            } else {
                $loading.finish('load');
            }
        };

        $scope.limpar = function () {
            $scope.OnInit();
        };

        $scope.gravar = function () {
            $scope.erroCampo = false;
            $scope.textoErro = '';

            if ($scope.obj.descricao == '') {
                $scope.erroCampo = true;
                $scope.textoErro = '* Campo obrigatório';
                return;
            } else {
                $loading.start('load');
                $scope.erroCampo = false;
                $scope.textoErro = '';

                CentroCustoService.GravarCentroCusto($scope.obj)
                    .then(function (response) {
                        $loading.finish('load');

                        if (response.success) {

                            SweetAlert.swal({
                                title: "Sucesso!",
                                text: response.message,
                                type: "success"
                            },
                                function (isConfirm) {
                                    if (isConfirm) {
                                        $scope.OnInit();
                                    }
                                });
                        } else {
                            SweetAlert.swal({
                                title: "Erro!",
                                text: response.message,
                                type: "error"
                            });
                        }
                    }, function (error) {
                        console.log("Erro " + JSON.stringify(error));
                    });
            }
        };

        $scope.editar = function (data) {
            $uibModal.open({
                scope: $scope,
                backdrop: false,
                templateUrl: 'views/modal/CentroCusto/editar_centro_custo.html',
                controller: function ($scope, $uibModalInstance, centroCustoSelected, $timeout) {

                    $scope.objCentroCusto = {};
                    $scope.objCentroCusto.id = centroCustoSelected.id;
                    $scope.objCentroCusto.codigoEmpresa = centroCustoSelected.codigoEmpresa;
                    $scope.objCentroCusto.empresaId = centroCustoSelected.empresaId.toString();
                    $scope.objCentroCusto.descricao = centroCustoSelected.descricao;
                    $scope.objCentroCusto.ativo = centroCustoSelected.ativo;

                    $scope.alterar = function () {
                        $loading.start('load');

                        CentroCustoService.AtualizarCentroCusto($scope.objCentroCusto).then(function (response) {
                            $loading.finish('load');

                            if (response.success) {

                                $uibModalInstance.dismiss('dimiss');
                                SweetAlert.swal({
                                    title: "Sucesso!",
                                    text: response.message,
                                    type: "success"
                                },
                                    function (isConfirm) {
                                        if (isConfirm) {
                                            $scope.OnInit();
                                        }
                                    });
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
                    centroCustoSelected: function () {
                        return data;
                    }
                }
            });
        };

        $scope.change = function (texto) {
            if (texto.length >= 3 && $localStorage.user.filtroEmpresa != undefined) {
                $scope.erroCampo = false;
                $scope.textoErro = '';
                $scope.filtroEmpresaSelecionado = false;
            } else {
                $scope.filtroEmpresaSelecionado = true;
            }
        };

        $scope.OnInit();
    })
    .controller('ConfigCtrl', function ($scope, $localStorage) {
        $scope.user = $localStorage?.user;
    });