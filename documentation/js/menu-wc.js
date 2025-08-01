'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">nest-boilerplate documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AppModule-d69c7c4cfa44917b6ccba7d86da6b749f026b2dd8879fa9cb78e5679e2e0efc1d7a03bba604d3139ad868a786ecb22800c52de9a89bb3b2ea1b8621cb4cb39fe"' : 'data-bs-target="#xs-injectables-links-module-AppModule-d69c7c4cfa44917b6ccba7d86da6b749f026b2dd8879fa9cb78e5679e2e0efc1d7a03bba604d3139ad868a786ecb22800c52de9a89bb3b2ea1b8621cb4cb39fe"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AppModule-d69c7c4cfa44917b6ccba7d86da6b749f026b2dd8879fa9cb78e5679e2e0efc1d7a03bba604d3139ad868a786ecb22800c52de9a89bb3b2ea1b8621cb4cb39fe"' :
                                        'id="xs-injectables-links-module-AppModule-d69c7c4cfa44917b6ccba7d86da6b749f026b2dd8879fa9cb78e5679e2e0efc1d7a03bba604d3139ad868a786ecb22800c52de9a89bb3b2ea1b8621cb4cb39fe"' }>
                                        <li class="link">
                                            <a href="injectables/PrismaService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PrismaService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AuthModule.html" data-type="entity-link" >AuthModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AuthModule-ef4833981deb694ac5522641f28a6c2f46527fca8f4b61590120d85874d2736ee0cd176f753c2297b78849f5c30bb8c674c4a06ed64be72d621ced5dbb4351fc"' : 'data-bs-target="#xs-controllers-links-module-AuthModule-ef4833981deb694ac5522641f28a6c2f46527fca8f4b61590120d85874d2736ee0cd176f753c2297b78849f5c30bb8c674c4a06ed64be72d621ced5dbb4351fc"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AuthModule-ef4833981deb694ac5522641f28a6c2f46527fca8f4b61590120d85874d2736ee0cd176f753c2297b78849f5c30bb8c674c4a06ed64be72d621ced5dbb4351fc"' :
                                            'id="xs-controllers-links-module-AuthModule-ef4833981deb694ac5522641f28a6c2f46527fca8f4b61590120d85874d2736ee0cd176f753c2297b78849f5c30bb8c674c4a06ed64be72d621ced5dbb4351fc"' }>
                                            <li class="link">
                                                <a href="controllers/AuthController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AuthModule-ef4833981deb694ac5522641f28a6c2f46527fca8f4b61590120d85874d2736ee0cd176f753c2297b78849f5c30bb8c674c4a06ed64be72d621ced5dbb4351fc"' : 'data-bs-target="#xs-injectables-links-module-AuthModule-ef4833981deb694ac5522641f28a6c2f46527fca8f4b61590120d85874d2736ee0cd176f753c2297b78849f5c30bb8c674c4a06ed64be72d621ced5dbb4351fc"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AuthModule-ef4833981deb694ac5522641f28a6c2f46527fca8f4b61590120d85874d2736ee0cd176f753c2297b78849f5c30bb8c674c4a06ed64be72d621ced5dbb4351fc"' :
                                        'id="xs-injectables-links-module-AuthModule-ef4833981deb694ac5522641f28a6c2f46527fca8f4b61590120d85874d2736ee0cd176f753c2297b78849f5c30bb8c674c4a06ed64be72d621ced5dbb4351fc"' }>
                                        <li class="link">
                                            <a href="injectables/AuthService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/JwtStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >JwtStrategy</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/HomeModule.html" data-type="entity-link" >HomeModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-HomeModule-ce8cce6db7e8cd2d41c0e62c90050c128f0414f0c0775893e1361e003f04de37e7b1ecadc87d858f7d17dc3b33bc7d5179da9b0b9df701e42ba481f309efa1d3"' : 'data-bs-target="#xs-controllers-links-module-HomeModule-ce8cce6db7e8cd2d41c0e62c90050c128f0414f0c0775893e1361e003f04de37e7b1ecadc87d858f7d17dc3b33bc7d5179da9b0b9df701e42ba481f309efa1d3"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-HomeModule-ce8cce6db7e8cd2d41c0e62c90050c128f0414f0c0775893e1361e003f04de37e7b1ecadc87d858f7d17dc3b33bc7d5179da9b0b9df701e42ba481f309efa1d3"' :
                                            'id="xs-controllers-links-module-HomeModule-ce8cce6db7e8cd2d41c0e62c90050c128f0414f0c0775893e1361e003f04de37e7b1ecadc87d858f7d17dc3b33bc7d5179da9b0b9df701e42ba481f309efa1d3"' }>
                                            <li class="link">
                                                <a href="controllers/HomeController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HomeController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-HomeModule-ce8cce6db7e8cd2d41c0e62c90050c128f0414f0c0775893e1361e003f04de37e7b1ecadc87d858f7d17dc3b33bc7d5179da9b0b9df701e42ba481f309efa1d3"' : 'data-bs-target="#xs-injectables-links-module-HomeModule-ce8cce6db7e8cd2d41c0e62c90050c128f0414f0c0775893e1361e003f04de37e7b1ecadc87d858f7d17dc3b33bc7d5179da9b0b9df701e42ba481f309efa1d3"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-HomeModule-ce8cce6db7e8cd2d41c0e62c90050c128f0414f0c0775893e1361e003f04de37e7b1ecadc87d858f7d17dc3b33bc7d5179da9b0b9df701e42ba481f309efa1d3"' :
                                        'id="xs-injectables-links-module-HomeModule-ce8cce6db7e8cd2d41c0e62c90050c128f0414f0c0775893e1361e003f04de37e7b1ecadc87d858f7d17dc3b33bc7d5179da9b0b9df701e42ba481f309efa1d3"' }>
                                        <li class="link">
                                            <a href="injectables/HomeService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HomeService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/LogModule.html" data-type="entity-link" >LogModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-LogModule-e40bd14e50d6b8b59c8c120ca3814fa16bd34981d5891854da71361a603c27eb40f37a9b14bfe1aa3124e17c0f297d31ae95cfd8f099f4724e88d5146eedfbc4"' : 'data-bs-target="#xs-controllers-links-module-LogModule-e40bd14e50d6b8b59c8c120ca3814fa16bd34981d5891854da71361a603c27eb40f37a9b14bfe1aa3124e17c0f297d31ae95cfd8f099f4724e88d5146eedfbc4"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-LogModule-e40bd14e50d6b8b59c8c120ca3814fa16bd34981d5891854da71361a603c27eb40f37a9b14bfe1aa3124e17c0f297d31ae95cfd8f099f4724e88d5146eedfbc4"' :
                                            'id="xs-controllers-links-module-LogModule-e40bd14e50d6b8b59c8c120ca3814fa16bd34981d5891854da71361a603c27eb40f37a9b14bfe1aa3124e17c0f297d31ae95cfd8f099f4724e88d5146eedfbc4"' }>
                                            <li class="link">
                                                <a href="controllers/LogController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LogController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-LogModule-e40bd14e50d6b8b59c8c120ca3814fa16bd34981d5891854da71361a603c27eb40f37a9b14bfe1aa3124e17c0f297d31ae95cfd8f099f4724e88d5146eedfbc4"' : 'data-bs-target="#xs-injectables-links-module-LogModule-e40bd14e50d6b8b59c8c120ca3814fa16bd34981d5891854da71361a603c27eb40f37a9b14bfe1aa3124e17c0f297d31ae95cfd8f099f4724e88d5146eedfbc4"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-LogModule-e40bd14e50d6b8b59c8c120ca3814fa16bd34981d5891854da71361a603c27eb40f37a9b14bfe1aa3124e17c0f297d31ae95cfd8f099f4724e88d5146eedfbc4"' :
                                        'id="xs-injectables-links-module-LogModule-e40bd14e50d6b8b59c8c120ca3814fa16bd34981d5891854da71361a603c27eb40f37a9b14bfe1aa3124e17c0f297d31ae95cfd8f099f4724e88d5146eedfbc4"' }>
                                        <li class="link">
                                            <a href="injectables/LogService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LogService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/PrismaService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PrismaService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/UserModule.html" data-type="entity-link" >UserModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-UserModule-aad5d7f4dfaa28aefc3962494dd424dd96fc5172e3bc9fab2e1f4119cf904264182c59320c70cc7a81184ce1338ea9b9f7eda0d619aafc80388be971bec6724d"' : 'data-bs-target="#xs-controllers-links-module-UserModule-aad5d7f4dfaa28aefc3962494dd424dd96fc5172e3bc9fab2e1f4119cf904264182c59320c70cc7a81184ce1338ea9b9f7eda0d619aafc80388be971bec6724d"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-UserModule-aad5d7f4dfaa28aefc3962494dd424dd96fc5172e3bc9fab2e1f4119cf904264182c59320c70cc7a81184ce1338ea9b9f7eda0d619aafc80388be971bec6724d"' :
                                            'id="xs-controllers-links-module-UserModule-aad5d7f4dfaa28aefc3962494dd424dd96fc5172e3bc9fab2e1f4119cf904264182c59320c70cc7a81184ce1338ea9b9f7eda0d619aafc80388be971bec6724d"' }>
                                            <li class="link">
                                                <a href="controllers/UserController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-UserModule-aad5d7f4dfaa28aefc3962494dd424dd96fc5172e3bc9fab2e1f4119cf904264182c59320c70cc7a81184ce1338ea9b9f7eda0d619aafc80388be971bec6724d"' : 'data-bs-target="#xs-injectables-links-module-UserModule-aad5d7f4dfaa28aefc3962494dd424dd96fc5172e3bc9fab2e1f4119cf904264182c59320c70cc7a81184ce1338ea9b9f7eda0d619aafc80388be971bec6724d"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-UserModule-aad5d7f4dfaa28aefc3962494dd424dd96fc5172e3bc9fab2e1f4119cf904264182c59320c70cc7a81184ce1338ea9b9f7eda0d619aafc80388be971bec6724d"' :
                                        'id="xs-injectables-links-module-UserModule-aad5d7f4dfaa28aefc3962494dd424dd96fc5172e3bc9fab2e1f4119cf904264182c59320c70cc7a81184ce1338ea9b9f7eda0d619aafc80388be971bec6724d"' }>
                                        <li class="link">
                                            <a href="injectables/PrismaService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PrismaService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/UserService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#controllers-links"' :
                                'data-bs-target="#xs-controllers-links"' }>
                                <span class="icon ion-md-swap"></span>
                                <span>Controllers</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="controllers-links"' : 'id="xs-controllers-links"' }>
                                <li class="link">
                                    <a href="controllers/AuthController.html" data-type="entity-link" >AuthController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/HomeController.html" data-type="entity-link" >HomeController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/LogController.html" data-type="entity-link" >LogController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/UserController.html" data-type="entity-link" >UserController</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/CreateUserDto.html" data-type="entity-link" >CreateUserDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateUserDto.html" data-type="entity-link" >UpdateUserDto</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AuthService.html" data-type="entity-link" >AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/HomeService.html" data-type="entity-link" >HomeService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/JwtAuthGuard.html" data-type="entity-link" >JwtAuthGuard</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/JwtStrategy.html" data-type="entity-link" >JwtStrategy</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LoggerMiddleware.html" data-type="entity-link" >LoggerMiddleware</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LogService.html" data-type="entity-link" >LogService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PrismaService.html" data-type="entity-link" >PrismaService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserService.html" data-type="entity-link" >UserService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#guards-links"' :
                            'data-bs-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guards</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/RolesGuard.html" data-type="entity-link" >RolesGuard</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});