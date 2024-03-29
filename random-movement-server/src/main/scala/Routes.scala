import Types.MapStructure.{MapLayer, SimulationMap}
import Types.{MapInfo, MapResponse}
import cats._
import cats.effect._
import cats.implicits._
import org.http4s.circe._
import org.http4s._
import io.circe.generic.auto._
import io.circe.syntax._
import org.http4s.dsl._

import java.util.UUID
import scala.collection.mutable
import scala.util.Random

object Routes {
  val simulationMaps: mutable.Map[UUID, MapInfo] = mutable.Map()

  def mapRoutes[F[_] : Concurrent]: HttpRoutes[F] = {
    val dsl = Http4sDsl[F]
    import dsl._
    implicit val decoderMap: EntityDecoder[F, SimulationMap] = jsonOf[F, SimulationMap]
    implicit val decoderLayer: EntityDecoder[F, MapLayer] = jsonOf[F, MapLayer]

    HttpRoutes.of[F] {
      case GET -> Root / "map" / UUIDVar(mapId) =>
        simulationMaps.get(mapId) match {
          case Some(info: MapInfo) => Ok(Random.shuffle(info.publicTiles).head.asJson)
          case _ => NotFound()
        }
      case DELETE -> Root / "map" / UUIDVar(mapId) =>
        simulationMaps.remove(mapId) match {
          case Some(_: MapInfo) => Ok()
          case _ => NotFound()
        }
      case req@POST -> Root / "map" =>
        for {
          simulationMap <- req.as[SimulationMap]
          uid = UUID.randomUUID()
          mapInfo = MapParser.convertMap(simulationMap)
          _ = simulationMaps.put(uid, mapInfo)
          res <- Ok(MapResponse(id = uid,
            privateTiles = mapInfo.privateTiles,
            width = simulationMap.layers.head.width,
            height = simulationMap.layers.head.height
          ).asJson)
        } yield res
    }
  }

  def toolRoutes[F[_] : Monad]: HttpRoutes[F] = {
    val dsl = Http4sDsl[F]
    import dsl._

    HttpRoutes.of[F] {
      case GET -> Root / "health" =>
        Ok(Map("status" -> "ok").asJson)
    }
  }

  def allRoutes[F[_] : Concurrent]: HttpRoutes[F] = {
    mapRoutes <+> toolRoutes
  }
}
