package br.com.renova.guia.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import br.com.renova.guia.data.ColaEntry
import br.com.renova.guia.data.OrthoContent
import br.com.renova.guia.data.Routes
import br.com.renova.guia.ui.components.CidChip
import br.com.renova.guia.ui.components.MutedText
import br.com.renova.guia.ui.components.copyText
import br.com.renova.guia.ui.components.shareText

/*
 * A cola do plantão: os textos prontos do prontuário, da receita e da
 * medicação (ortopedia.cola do pacote), por grupo, cada um com Copiar e
 * Enviar. O tópico do guia mostra as suas colas no fim.
 */

@Composable
fun ColaScreen(ortho: OrthoContent, onBack: () -> Unit, onOpen: (String) -> Unit) {
    val groups = ortho.tab.colaGroups
    var group by rememberSaveable { mutableStateOf<String?>(null) }
    val list = ortho.tab.cola.filter { group == null || it.group == group }
    ScreenScaffold(title = "Cola do plantão", onBack = onBack) { padding ->
        Column(Modifier.padding(padding).fillMaxSize()) {
            MutedText(
                "Textos prontos como vão no prontuário. Abra, confira o que é do paciente (lado, CID, dose por peso) e copie.",
                Modifier.padding(horizontal = 16.dp, vertical = 6.dp),
            )
            androidx.compose.foundation.lazy.LazyRow(contentPadding = PaddingValues(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                item { FilterChip(selected = group == null, onClick = { group = null }, label = { Text("Todas ${ortho.tab.cola.size}") }) }
                items(groups) { g ->
                    FilterChip(selected = group == g.id, onClick = { group = g.id }, label = { Text("${g.label} ${ortho.tab.cola.count { it.group == g.id }}") })
                }
            }
            LazyColumn(contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 8.dp, bottom = 24.dp), verticalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.testTag("cola-list")) {
                items(list, key = { it.id }) { c -> ColaCard(c, topicTitle = c.topic?.let { ortho.topic(it)?.title }, onOpenTopic = { c.topic?.let { onOpen(Routes.ortoTopic(it)) } }) }
            }
        }
    }
}

/** Um texto da cola: fechado mostra título e CID; aberto, o texto inteiro com Copiar e Enviar. */
@Composable
fun ColaCard(c: ColaEntry, topicTitle: String? = null, onOpenTopic: (() -> Unit)? = null, startOpen: Boolean = false) {
    val context = LocalContext.current
    var open by rememberSaveable(c.id) { mutableStateOf(startOpen) }
    Card(
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainerLowest),
        border = CardDefaults.outlinedCardBorder(),
        modifier = Modifier.fillMaxWidth(),
    ) {
        Column(Modifier.clickable { open = !open }.padding(horizontal = 14.dp, vertical = 10.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Filled.Description, contentDescription = null, tint = MaterialTheme.colorScheme.secondary, modifier = Modifier.size(18.dp))
                Spacer(Modifier.size(8.dp))
                Column(Modifier.weight(1f)) {
                    Text(c.title, fontWeight = FontWeight.ExtraBold, style = MaterialTheme.typography.bodyMedium)
                    c.hint?.let { MutedText(it) }
                }
                c.cid?.let { CidChip("CID $it") }
            }
            if (open) {
                Text(
                    c.text,
                    style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier.padding(top = 10.dp).fillMaxWidth().clip(RoundedCornerShape(10.dp)).background(MaterialTheme.colorScheme.surfaceContainerLow).padding(10.dp),
                )
                Row(Modifier.padding(top = 10.dp), horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                    Button(onClick = { copyText(context, c.title, c.text) }, modifier = Modifier.testTag("cola-copy")) {
                        Icon(Icons.Filled.ContentCopy, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(Modifier.size(6.dp))
                        Text("Copiar")
                    }
                    OutlinedButton(onClick = { shareText(context, c.text) }) {
                        Icon(Icons.Filled.Share, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(Modifier.size(6.dp))
                        Text("Enviar")
                    }
                }
                if (topicTitle != null && onOpenTopic != null) {
                    Text(
                        "No guia: $topicTitle",
                        color = MaterialTheme.colorScheme.secondary,
                        fontWeight = FontWeight.Bold,
                        style = MaterialTheme.typography.bodySmall,
                        modifier = Modifier.padding(top = 8.dp).clickable(onClick = onOpenTopic),
                    )
                }
            }
        }
    }
}
