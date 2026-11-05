package br.com.renova.guia

import android.os.ParcelFileDescriptor
import androidx.compose.ui.test.ExperimentalTestApi
import androidx.compose.ui.test.hasText
import androidx.compose.ui.test.junit4.createEmptyComposeRule
import androidx.compose.ui.test.onAllNodesWithTag
import androidx.compose.ui.test.onAllNodesWithText
import androidx.compose.ui.test.onFirst
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performScrollTo
import androidx.compose.ui.test.performTextClearance
import androidx.compose.ui.test.performTextInput
import androidx.test.core.app.ActivityScenario
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import br.com.renova.guia.data.GuideBundle
import br.com.renova.guia.data.GuideJson
import br.com.renova.guia.data.GuideRepository
import okhttp3.mockwebserver.Dispatcher
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import okhttp3.mockwebserver.RecordedRequest
import org.junit.After
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import java.io.File

/**
 * O app de ponta a ponta no emulador, contra um servidor falso (nada vai à
 * produção): abre sem conta, baixa o guia, avisa da revisão nova, busca,
 * tópico com procedimentos, consulta guiada, menu e Sobre, modo escuro. Cada
 * passo vira uma foto da tela (/sdcard/Download/renova), que o GitHub
 * Actions publica.
 */
@OptIn(ExperimentalTestApi::class)
@RunWith(AndroidJUnit4::class)
class AppFlowTest {
    @get:Rule
    val compose = createEmptyComposeRule()

    private lateinit var server: MockWebServer
    private val bundleJson: String by lazy {
        InstrumentationRegistry.getInstrumentation().context.assets.open("guia.json").use { it.readBytes().toString(Charsets.UTF_8) }
    }
    private val bundle: GuideBundle by lazy { GuideJson.decodeFromString<GuideBundle>(bundleJson) }

    @Before
    fun setUp() {
        server = MockWebServer()
        server.dispatcher = object : Dispatcher() {
            override fun dispatch(request: RecordedRequest): MockResponse {
                val path = request.path ?: ""
                return when {
                    path.startsWith("/api/app/guia") ->
                        if (request.getHeader("If-None-Match") == "\"${bundle.version}\"") MockResponse().setResponseCode(304) else MockResponse().setBody(bundleJson)
                    // Ilustrações e imagens: o servidor falso não as tem; o app segue sem elas.
                    else -> MockResponse().setResponseCode(404)
                }
            }
        }
        server.start()
        ServerConfig.baseUrl = server.url("/").toString()

        // Começa do zero: sem guia no aparelho; a última revisão vista é a anterior (para o aviso aparecer).
        val app = ApplicationProvider.getApplicationContext<RenovaGuiaApp>()
        app.container.tokens.clear()
        File(app.filesDir, GuideRepository.FILE_NAME).delete()
        app.container.prefs.lastSeenRevision = bundle.revision.current - 1
        shell("mkdir -p /sdcard/Download/renova")
    }

    @After
    fun tearDown() {
        shell("cmd uimode night no")
        server.shutdown()
    }

    private fun shell(command: String) {
        val pfd = InstrumentationRegistry.getInstrumentation().uiAutomation.executeShellCommand(command)
        ParcelFileDescriptor.AutoCloseInputStream(pfd).use { it.readBytes() }
    }

    private fun shot(name: String) {
        compose.waitForIdle()
        Thread.sleep(700)
        shell("screencap -p /sdcard/Download/renova/$name.png")
    }

    private fun waitForText(text: String, timeout: Long = 20_000) {
        compose.waitUntil(timeout) { compose.onAllNodesWithText(text, substring = true).fetchSemanticsNodes().isNotEmpty() }
    }

    private fun waitForTag(tag: String, timeout: Long = 20_000) {
        compose.waitUntil(timeout) { compose.onAllNodesWithTag(tag).fetchSemanticsNodes().isNotEmpty() }
    }

    private fun back() {
        InstrumentationRegistry.getInstrumentation().uiAutomation.performGlobalAction(android.accessibilityservice.AccessibilityService.GLOBAL_ACTION_BACK)
        compose.waitForIdle()
    }

    @Test
    fun fluxoCompleto() {
        ActivityScenario.launch(MainActivity::class.java).use {
            // Sem login: o guia baixa e chega numa revisão mais nova que a última vista — aviso.
            waitForTag("see-changes", 180_000)
            shot("01-aviso-revisao-nova")
            compose.onNodeWithText("Depois").performClick()

            // A tela de abertura: busca, "Atender agora", atalhos do primeiro dia e os capítulos.
            waitForText("Atender agora", 60_000)
            shot("02-inicio")

            // Busca por como o paciente fala.
            compose.onNodeWithTag("orto-search").performTextInput("torceu o pé")
            waitForText("Entorse de tornozelo", 60_000)
            shot("03-busca")
            compose.onAllNodesWithText("Entorse de tornozelo").onFirst().performClick()
            waitForText("PERGUNTAR")
            shot("04-topico")
            compose.onAllNodesWithText("ALARME").onFirst().performScrollTo()
            shot("05-topico-alarme")
            back()

            // Um tópico com procedimentos ilustrados e imagens de referência.
            waitForTag("orto-search")
            compose.onNodeWithTag("orto-search").performTextClearance()
            compose.onNodeWithTag("orto-search").performTextInput("luxação do ombro")
            waitForText("Luxação e instabilidade do ombro", 60_000)
            compose.onAllNodesWithText("Luxação e instabilidade do ombro").onFirst().performClick()
            waitForText("PROCEDIMENTOS", 30_000)
            compose.onAllNodesWithText("PROCEDIMENTOS").onFirst().performScrollTo()
            shot("06-procedimentos")
            compose.onAllNodesWithText("IMAGENS DE REFERÊNCIA").onFirst().performScrollTo()
            shot("07-imagens-de-referencia")

            // Consulta guiada a partir do tópico.
            compose.onNodeWithTag("orto-attend-topic").performScrollTo().performClick()
            Thread.sleep(1500)
            shot("08-consulta-guiada")
            back()
            back()

            // A cola do plantão: lista, um texto aberto, Copiar.
            waitForTag("orto-cola")
            compose.onNodeWithTag("orto-cola").performClick()
            waitForTag("cola-list")
            shot("08b-cola")
            compose.onAllNodesWithText("Lombalgia aguda").onFirst().performClick()
            waitForTag("cola-copy")
            shot("08c-cola-aberta")
            back()

            // Menu: o que mudou e Sobre.
            waitForTag("menu")
            compose.onNodeWithTag("menu").performClick()
            waitForTag("menu-sobre")
            shot("09-menu")
            compose.onNodeWithTag("menu-sobre").performClick()
            waitForText("Sobre o app")
            shot("10-sobre")
            back()

            // Modo escuro (plantão de madrugada).
            shell("cmd uimode night yes")
            Thread.sleep(2500)
            shot("11-modo-escuro")
        }
    }
}
